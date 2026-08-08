<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MongoUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Budi Santoso',
                'email' => 'user@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'jenjang_pendidikan' => 'SMA',
            ],
            [
                'name' => 'Dr. Sarah Wijaya, M.Pd',
                'email' => 'pakar@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'pakar',
                'jenjang_pendidikan' => 'Kuliah',
            ],
            [
                'name' => 'Admin Ba-Yu',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'jenjang_pendidikan' => 'Kuliah',
            ],
        ];

        foreach ($users as $u) {
            $existing = User::where('email', $u['email'])->first();
            if (! $existing) {
                User::create($u);
                $this->command->info("Created user: {$u['email']}");
            } else {
                $existing->update($u);
                $this->command->info("Updated user: {$u['email']}");
            }
        }

        $this->command->info('MongoDB Users Seeded Successfully!');
    }
}
