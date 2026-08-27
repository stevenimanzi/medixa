<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PharmacyController extends Controller
{
    public function show(Request $request)
    {
        // Get the company associated with the authenticated user
        $company = $request->user()->company;
        
        return response()->json($company);
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'tin' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $company = $request->user()->company;
        
        $company->update($request->only([
            'name',
            'tin',
            'location',
            'phone',
            'email'
        ]));

        return response()->json([
            'message' => 'Pharmacy details updated successfully',
            'company' => $company
        ]);
    }
}
