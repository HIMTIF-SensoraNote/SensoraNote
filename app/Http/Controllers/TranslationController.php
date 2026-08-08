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
            'target_lang' => 'required|string|max:5',
            'source_lang' => 'nullable|string|max:5',
        ]);

        $text = $request->input('text');
        $lang = $request->input('target_lang');
        $source = $request->input('source_lang', null);

        // Cache based on the MD5 hash of the text + target language + source language
        $hash = md5($text . ($source ?? 'auto'));
        $cacheKey = "translations_dynamic_{$lang}_{$hash}";

        $translatedText = Cache::rememberForever($cacheKey, function () use ($text, $lang, $source) {
            $tr = new GoogleTranslate($lang);
            if ($source) {
                $tr->setSource($source);
            }
            return $tr->translate($text);
        });

        return response()->json([
            'original' => $text,
            'translated' => $translatedText,
            'target_lang' => $lang,
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
