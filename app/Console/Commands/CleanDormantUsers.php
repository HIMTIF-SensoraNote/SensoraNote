<?php

namespace App\Console\Commands;

use App\Models\Bookmark;
use App\Models\Comment;
use App\Models\Follow;
use App\Models\LearningHistory;
use App\Models\Like;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanDormantUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clean-dormant-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently deletes dormant accounts older than 30 days and all their associated data.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of dormant users...');
        Log::info('CleanDormantUsers: Starting execution.');

        // Find users who have been dormant for more than 30 days
        $thresholdDate = Carbon::now()->subDays(30);

        $dormantUsers = User::where('is_dormant', true)
            ->where('deactivated_at', '<', $thresholdDate)
            ->get();

        if ($dormantUsers->isEmpty()) {
            $this->info('No dormant users to clean up today.');
            Log::info('CleanDormantUsers: No users found.');

            return;
        }

        $count = 0;
        foreach ($dormantUsers as $user) {
            /** @var User $user */
            $userIdStr = (string) $user->_id;

            // Delete Posts and their references
            $posts = Post::where('user_id', $userIdStr)->get();
            foreach ($posts as $post) {
                $postIdStr = (string) $post->_id;
                // Delete comments of this post
                Comment::where('post_id', $postIdStr)->delete();
                // Delete likes of this post
                Like::where('post_id', $postIdStr)->delete();
                // Delete bookmarks of this post
                Bookmark::where('post_id', $postIdStr)->delete();
                // Delete learning history of this post
                LearningHistory::where('post_id', $postIdStr)->delete();

                $post->delete();
            }

            // Delete Comments made by the user
            Comment::where('user_id', $userIdStr)->delete();

            // Delete Likes made by the user
            Like::where('user_id', $userIdStr)->delete();

            // Delete Follows
            Follow::where('follower_id', $userIdStr)->orWhere('following_id', $userIdStr)->delete();

            // Delete Notifications
            Notification::where('user_id', $userIdStr)->orWhere('actor_id', $userIdStr)->delete();

            // Delete Learning History made by the user
            LearningHistory::where('user_id', $userIdStr)->delete();

            // Delete Bookmarks made by the user
            Bookmark::where('user_id', $userIdStr)->delete();

            // Finally, delete the user
            $user->delete();
            $count++;

            $this->info("Deleted user: {$user->email} ({$userIdStr})");
        }

        $this->info("Successfully deleted {$count} dormant user(s).");
        Log::info("CleanDormantUsers: Successfully deleted {$count} dormant user(s).");
    }
}
