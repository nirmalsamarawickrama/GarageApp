package com.autopulse.garage.data.local.dao

import androidx.room.*
import com.autopulse.garage.data.local.entity.EmployeeEntity
import com.autopulse.garage.data.local.entity.InventoryEntity
import com.autopulse.garage.data.local.entity.JobCardEntity
import com.autopulse.garage.data.local.entity.MutationQueueEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface JobCardDao {
    @Query("SELECT * FROM job_cards WHERE branchId = :branchId ORDER BY updatedAt DESC")
    fun getJobCardsByBranch(branchId: String): Flow<List<JobCardEntity>>

    @Query("SELECT * FROM job_cards WHERE id = :jobId")
    suspend fun getJobById(jobId: String): JobCardEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(job: JobCardEntity)

    @Query("UPDATE job_cards SET status = :status, version = version + 1, syncState = 2, updatedAt = :timestamp WHERE id = :jobId")
    suspend fun updateStatus(jobId: String, status: String, timestamp: Long = System.currentTimeMillis())
}

@Dao
interface InventoryDao {
    @Query("SELECT * FROM inventory_items WHERE branchId = :branchId ORDER BY name ASC")
    fun getInventory(branchId: String): Flow<List<InventoryEntity>>

    @Query("SELECT * FROM inventory_items WHERE barcode = :barcode LIMIT 1")
    suspend fun findByBarcode(barcode: String): InventoryEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(item: InventoryEntity)

    @Query("UPDATE inventory_items SET stockQty = stockQty + :delta, version = version + 1, syncState = 2 WHERE id = :id")
    suspend fun adjustStock(id: String, delta: Int)
}

@Dao
interface EmployeeDao {
    @Query("SELECT * FROM employees WHERE branchId = :branchId")
    fun getEmployees(branchId: String): Flow<List<EmployeeEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(employees: List<EmployeeEntity>)

    @Query("UPDATE employees SET status = :status, currentJobCardId = :jobId WHERE id = :empId")
    suspend fun updateWorkStatus(empId: String, status: String, jobId: String?)
}

@Dao
interface MutationQueueDao {
    @Query("SELECT * FROM mutation_queue WHERE status = 'PENDING' ORDER BY timestamp ASC")
    suspend fun getPendingMutations(): List<MutationQueueEntity>

    @Insert
    suspend fun enqueue(mutation: MutationQueueEntity)

    @Delete
    suspend fun remove(mutation: MutationQueueEntity)

    @Query("DELETE FROM mutation_queue WHERE id = :id")
    suspend fun deleteById(id: String)
}
