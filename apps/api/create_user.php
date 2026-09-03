<?php
use App\Models\User;

$user = new User();
$user->name = 'Steven Imanzi';
$user->email = 'stivenimanzi1@gmail.com';
$user->password = 'Enterin@12';
$user->save();

echo "User created with ID: " . $user->id . "\n";
