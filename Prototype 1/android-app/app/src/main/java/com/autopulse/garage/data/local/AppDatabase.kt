package com.autopulse.garage.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.autopulse.garage.data.local.dao.EmployeeDao
import com.autopulse.garage.data.local.dao.InventoryDao
import com.autopulse.garage.data.local.dao.JobCardDao
import com.autopulse.garage.data.local.dao.MutationQueueDao
import com.autopulse.garage.data.local.entity.EmployeeEntity
import com.autopulse.garage.data.local.entity.InventoryEntity
import com.autopulse.garage.data.local.entity.JobCardEntity
import com.autopulse.garage.data.local.entity.MutationQueueEntity

@Database(
    entities = [
        JobCardEntity::class,
        InventoryEntity::class,
        EmployeeEntity::class,
        MutationQueueEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun jobCardDao(): JobCardDao
    abstract fun inventoryDao(): InventoryDao
    abstract fun employeeDao(): EmployeeDao
    abstract fun mutationQueueDao(): MutationQueueDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "autopulse_offline_db.sqlite"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
