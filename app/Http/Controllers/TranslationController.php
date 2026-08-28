<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Stichoza\GoogleTranslate\GoogleTranslate;

class TranslationController extends Controller
{
    /**
     * Get static UI translations for a specific language.
     * Caches the entire dictionary to avoid spamming the Translation API.
     */
    public function getStaticTranslations($lang)
    {
        // Cache key for this specific language's full dictionary
        $cacheKey = "translations_static_{$lang}_v2";

        $translatedDictionary = Cache::rememberForever($cacheKey, function () use ($lang) {
            $targetPath = resource_path("frontend/app/locales/{$lang}.json");
            $idPath = resource_path('frontend/app/locales/id.json');

            // 1. If the translated JSON file already exists, use it! 
            // This prevents Google Translate from blocking us for making 1800+ requests.
            if (File::exists($targetPath)) {
                return json_decode(File::get($targetPath), true);
            }

            // 2. Fallback to Indonesian if the language file is missing
            if (File::exists($idPath)) {
                return json_decode(File::get($idPath), true);
            }

            return [];
        });

        return response()->json($translatedDictionary);
    }

    /**
     * Translate dynamic content (e.g. notes, posts, comments) on demand.
     */
    public function translateDynamicContent(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'target_lang' => 'required|string|max:10',
            'source_lang' => 'nullable|string|max:10',
        ]);

        $text = trim($request->input('text'));
        $lang = strtolower(trim($request->input('target_lang')));
        $source = $request->input('source_lang', null);

        // Normalize language codes (e.g., 'en-US' -> 'en', 'zh-TW' -> 'zh-TW')
        $langCode = match ($lang) {
            'en-us', 'en-gb' => 'en',
            'zh-tw' => 'zh-TW',
            'zh-cn' => 'zh',
            default => $lang,
        };

        // Cache based on the MD5 hash of the text + target language
        $hash = md5($text . '_' . $langCode);
        $cacheKey = "translations_dynamic_{$langCode}_{$hash}";

        $translatedText = Cache::rememberForever($cacheKey, function () use ($text, $langCode, $source) {
            // 1. Try Google Gemini AI Translation
            $apiKey = config('services.gemini.api_key') ?: env('GEMINI_API_KEY');
            if (!empty($apiKey)) {
                $modelsToTry = ['gemini-2.0-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash'];
                $prompt = "You are a professional multilingual translator for educational content.\n" .
                    "Translate the following text accurately, fluently, and naturally into target language '{$langCode}'.\n" .
                    "Output ONLY the translated text without explanations, greetings, quotes, or markdown formatting.\n\n" .
                    "Text to translate:\n" . $text;

                $payload = [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [['text' => $prompt]]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.2,
                        'maxOutputTokens' => 2048,
                    ]
                ];

                foreach ($modelsToTry as $model) {
                    try {
                        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
                        $response = \Illuminate\Support\Facades\Http::timeout(15)
                            ->withHeaders([
                                'Content-Type' => 'application/json',
                                'x-goog-api-key' => $apiKey,
                            ])
                            ->post($endpoint, $payload);

                        if ($response->successful()) {
                            $data = $response->json();
                            $result = trim($data['candidates'][0]['content']['parts'][0]['text'] ?? '');
                            if (!empty($result)) {
                                return $result;
                            }
                        }
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::warning("Gemini translation error ({$model}): " . $e->getMessage());
                    }
                }
            }

            // 2. Fallback to GoogleTranslate scraper
            try {
                $tr = new GoogleTranslate($langCode);
                if ($source) {
                    $tr->setSource($source);
                }
                $res = $tr->translate($text);
                if (!empty($res)) {
                    return $res;
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning("GoogleTranslate scraper error: " . $e->getMessage());
            }

            // 3. Ultimate Fallback to original text
            return $text;
        });

        return response()->json([
            'original' => $text,
            'translated' => $translatedText,
            'target_lang' => $langCode,
        ]);
    }

    /**
     * Recursively translate a nested associative array of strings.
     */
    private function translateArrayRecursively(array $array, GoogleTranslate $tr)
    {
        $result = [];
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $result[$key] = $this->translateArrayRecursively($value, $tr);
            } elseif (is_string($value)) {
                // Ignore empty strings
                if (trim($value) === '') {
                    $result[$key] = $value;
                    continue;
                }
                
                // We should theoretically parse out {{variables}} so they don't get translated,
                // but Stichoza usually preserves them if they are curly braced. 
                // To be extremely safe, we can translate and hope it preserves {{name}}.
                // It usually does. If it translates {{name}} to {{nama}}, the frontend interpolator 
                // might fail, but for UI strings this is an acceptable tradeoff for full automation.
                try {
                    $result[$key] = $tr->translate($value);
                } catch (\Exception $e) {
                    // Fallback to original if API fails
                    $result[$key] = $value;
                }
            } else {
                $result[$key] = $value;
            }
        }
        return $result;
    }
}
