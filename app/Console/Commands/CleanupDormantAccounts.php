<?php

namespace App\Console\Commands;

use App\Models\Comment;
use App\Models\Follow;
use App\Models\Like;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Console\Command;

class CleanupDormantAccounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'accounts:cleanup-dormant';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently delete users and their data if they have been dormant for more than 30 days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $cutoffDate = now()->subDays(30);

        $usersToDelete = User::where('is_dormant', true)
            ->where('deactivated_at', '<=', $cutoffDate)
            ->get();

        $count = 0;
        /** @var User $user */
        foreach ($usersToDelete as $user) {
            $userIdStr = (string) $user->_id;

            // Delete all related content
            Post::where('user_id', $userIdStr)->delete();
            Comment::where('user_id', $userIdStr)->delete();
            Like::where('user_id', $userIdStr)->delete();
            Follow::where('follower_id', $userIdStr)->orWhere('following_id', $userIdStr)->delete();
            Notification::where('user_id', $userIdStr)->orWhere('actor_id', $userIdStr)->delete();

            $user->delete();
            $count++;
        }

        $this->info("Successfully deleted {$count} dormant accounts and their associated data.");
    }
}
