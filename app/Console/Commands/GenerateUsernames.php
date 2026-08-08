<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class GenerateUsernames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:generate-usernames';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate unique usernames for users who do not have one.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::whereNull('username')->orWhere('username', '')->get();
        $count = 0;

        /** @var User $user */
        foreach ($users as $user) {
            $baseName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $user->name));
            if (empty($baseName)) {
                $baseName = 'user';
            }

            $username = $baseName;
            $suffix = 1;

            while (User::where('username', $username)->exists()) {
                $username = $baseName.$suffix;
                $suffix++;
            }

            $user->username = $username;
            $user->save();

            $count++;
            $this->info("Generated username {$username} for user {$user->name}");
        }

        $this->info("Successfully generated usernames for {$count} users.");
    }
}
