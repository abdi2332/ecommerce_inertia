<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['pending', 'paid', 'failed', 'cancelled', 'delivered'])->default('pending');
            $table->enum('payment_method', ['chapa', 'telebirr', 'cod'])->nullable();
            $table->enum('payment_status', ['unpaid', 'processing', 'paid', 'failed', 'refunded'])->default('unpaid');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('shipping_fee', 10, 2)->default(0);
            $table->decimal('payment_fee', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->foreignId('shipping_address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('orders');
    }
};
