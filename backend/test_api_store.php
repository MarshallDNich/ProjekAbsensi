<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Controllers\Api\UserController;
use App\Services\UserService;
use App\Repositories\UserRepository;

try {
    echo "Testing StoreUserRequest API validation & controller...\n";

    $payload = [
        'nama' => 'Testing API User',
        'email' => 'testapi@school.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'Guru',
        'status' => 'Aktif',
        'nip' => '199001012020011002',
        'jenis_kelamin' => 'Laki-laki',
        'nomor_telepon' => '081299998888',
        'alamat' => 'Jl. Guru No 5',
    ];

    $request = StoreUserRequest::create('/api/users', 'POST', $payload);
    $request->headers->set('Accept', 'application/json');

    $container = Illuminate\Container\Container::getInstance();
    $request->setContainer($container);

    // Validate request
    $validator = Validator::make($payload, (new StoreUserRequest())->rules(), (new StoreUserRequest())->messages());

    if ($validator->fails()) {
        echo "VALIDATION FAILED:\n";
        print_r($validator->errors()->toArray());
    } else {
        echo "VALIDATION SUCCESSFUL!\n";
        $controller = new UserController(new UserService(new UserRepository()));
        // Call store
        $requestValidated = new StoreUserRequest();
        $requestValidated->initialize($payload);
        $requestValidated->setContainer($container);
        
        $response = $controller->store($requestValidated);
        echo "HTTP Status Code: " . $response->getStatusCode() . "\n";
        echo "Response Data: " . $response->getContent() . "\n";
    }

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "TRACE:\n" . $e->getTraceAsString() . "\n";
}
