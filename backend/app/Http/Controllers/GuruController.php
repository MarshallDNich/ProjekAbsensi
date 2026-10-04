<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\User;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Guru\StoreGuruRequest;
use App\Http\Requests\Guru\UpdateGuruRequest;

class GuruController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
{
    $search = request('search');

    $gurus = Guru::with('user')

        ->when($search, function ($query) use ($search) {
            $query->where('nama', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
        })

        ->latest()

        ->paginate(10)

        ->withQueryString();

    return view('gurus.index', compact('gurus'));
}

    /**
     * Show the form for creating a new resource.
     */
   public function create(): View
{
    $users = User::where('role', 'Guru')
        ->whereDoesntHave('guru')
        ->orderBy('nama')
        ->get();

    return view('gurus.create', compact('users'));
}
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGuruRequest $request): RedirectResponse
{
    Guru::create($request->validated());

    return redirect()
        ->route('gurus.index')
        ->with('success', 'Data guru berhasil ditambahkan.');
}

    /**
     * Display the specified resource.
     */
    public function show(Guru $guru)
{
    abort(404);
}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Guru $guru): View
{
    $users = User::where('role', 'Guru')
        ->where(function ($query) use ($guru) {
            $query->whereDoesntHave('guru')
                  ->orWhere('id', $guru->user_id);
        })
        ->orderBy('nama')
        ->get();

    return view('gurus.edit', compact('guru', 'users'));
}

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGuruRequest $request, Guru $guru): RedirectResponse
{
    DB::transaction(function () use ($request, $guru) {

        // Update data user
        $user = $guru->user;

        $user->nama = $request->nama;
        $user->email = $request->email;

        // Password hanya diubah jika diisi
        if ($request->filled('password')) {
            $user->password = $request->password;
        }

        $user->save();

        // Update data guru
        $guru->update([
            'nip' => $request->nip,
            'nama' => $request->nama,
            'jenis_kelamin' => $request->jenis_kelamin,
            'nomor_telepon' => $request->nomor_telepon,
            'alamat' => $request->alamat,
        ]);

    });

    return redirect()
        ->route('gurus.index')
        ->with('success', 'Data guru berhasil diperbarui.');
}

    /**
     * Remove the specified resource from storage.
     */
   public function destroy(Guru $guru): RedirectResponse
{
    DB::transaction(function () use ($guru) {

        $guru->user->delete();

        $guru->delete();

    });

    return redirect()
        ->route('gurus.index')
        ->with('success', 'Data guru berhasil dihapus.');
}
}
