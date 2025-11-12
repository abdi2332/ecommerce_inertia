<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }
    
    public function handleGoogleCallback()
    {
        try {
            $socialUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect('/login');  // redirect to login page on error
        }
    
        $user = User::where('google_id', $socialUser->getId())
                    ->orWhere('email', $socialUser->getEmail())
                    ->first();
    
        if (! $user) {
            $user = User::create([
                'name'         => $socialUser->getName(),
                'email'        => $socialUser->getEmail(),
                'google_id'    => $socialUser->getId(),
                'password'     => bcrypt(Str::random(24)),
                'email_verified_at' => now(),
            ]);
        }
    
        Auth::login($user, true);
    
        return redirect()->intended('/');
    }
    
}
