<?php

namespace App\Console\Commands;

use App\Models\Inspection;
use App\Models\User;
use App\Models\Customer;
use Illuminate\Console\Command;

class CreateDummyInspection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-dummy-inspection';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Creates a dummy inspection record for testing.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $user = User::first();
        if (!$user) {
            $this->error('No user found. Please create a user first.');
            return Command::FAILURE;
        }

        $customer = Customer::first();
        if (!$customer) {
            $this->error('No customer found. Please create a customer first.');
            return Command::FAILURE;
        }

        Inspection::create([
            'user_id' => $user->id,
            'customer_id' => $customer->id,
            'location' => 'Dummy Location from Command',
            'condition' => 'baik',
            'estimate_cost' => 'Rp 1.000.000',
            'finding' => 'Dummy Finding from Command',
            'analysis' => 'Dummy Analysis from Command',
            'recommendation' => 'Dummy Recommendation from Command',
            'component_name' => 'Dummy Component from Command',
            'component_function' => 'Dummy Function from Command',
            'component_condition' => 'Dummy Component Condition from Command',
            'check_results' => 'Dummy Check Results from Command',
        ]);

        $this->info('Dummy inspection created successfully.');

        return Command::SUCCESS;
    }
}
