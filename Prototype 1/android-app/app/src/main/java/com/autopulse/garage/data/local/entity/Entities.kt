package com.autopulse.garage.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "job_cards")
data class JobCardEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val jobNumber: String,
    val customerName: String,
    val customerPhone: String,
    val vehicleModel: String,
    val vehiclePlate: String,
    val vin: String,
    val status: String, // INTAKE, DIAGNOSIS, IN_REPAIR, QUALITY_CHECK, READY_DELIVERY
    val primaryComplaint: String,
    val assignedTechId: String?,
    val assignedTechName: String?,
    val assignedBay: String?,
    val estimatedLaborCost: Double,
    val partsCost: Double,
    val totalCost: Double,
    val branchId: String,
    val inspectionNotes: String?,
    val version: Long = 1,
    val updatedAt: Long = System.currentTimeMillis(),
    val syncState: Int = 0 // 0 = SYNCED, 1 = PENDING_INSERT, 2 = PENDING_UPDATE
)

@Entity(tableName = "inventory_items")
data class InventoryEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val sku: String,
    val oemNumber: String,
    val name: String,
    val category: String,
    val stockQty: Int,
    val minSafetyStock: Int,
    val unitCost: Double,
    val retailPrice: Double,
    val unitOfMeasure: String,
    val branchId: String,
    val barcode: String,
    val lastRestocked: String,
    val version: Long = 1,
    val syncState: Int = 0
)

@Entity(tableName = "employees")
data class EmployeeEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val role: String,
    val phone: String,
    val branchId: String,
    val activeBay: String?,
    val currentJobCardId: String?,
    val status: String,
    val billedHoursThisMonth: Int,
    val actualHoursThisMonth: Int,
    val efficiencyRating: Int,
    val completedJobsCount: Int
)

@Entity(tableName = "mutation_queue")
data class MutationQueueEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val entityType: String, // JOB_CARD, INVENTORY, EMPLOYEE
    val action: String,     // CREATE, UPDATE, DELETE
    val payloadJson: String,
    val timestamp: Long = System.currentTimeMillis(),
    val retryCount: Int = 0,
    val status: String = "PENDING" // PENDING, SYNCING, FAILED
)
