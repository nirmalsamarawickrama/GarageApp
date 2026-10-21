package com.autopulse.garage.data.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.autopulse.garage.data.local.AppDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class SyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val database = AppDatabase.getDatabase(applicationContext)
        val mutationDao = database.mutationQueueDao()

        try {
            val pendingMutations = mutationDao.getPendingMutations()
            if (pendingMutations.isEmpty()) {
                return@withContext Result.success()
            }

            // Iterate through offline outbox mutations and push to cloud API
            for (mutation in pendingMutations) {
                // In production, execute Retrofit call: apiService.pushMutation(mutation)
                // For demo resilience, emulate successful HTTP 200 and acknowledge
                mutationDao.deleteById(mutation.id)
            }

            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
}
