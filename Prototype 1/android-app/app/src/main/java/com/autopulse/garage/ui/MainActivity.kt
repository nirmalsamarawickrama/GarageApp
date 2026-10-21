package com.autopulse.garage.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AutoPulseAppTheme {
                AutoPulseMainScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AutoPulseMainScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    var isOnline by remember { mutableStateOf(true) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "AutoPulse Garage",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White
                        )
                        Text(
                            text = if (isOnline) "🟢 Online • Cloud Synced" else "🔴 Offline • Local Room DB",
                            style = MaterialTheme.typography.bodySmall,
                            color = if (isOnline) Color(0xFF10B981) else Color(0xFFEF4444)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F172A)
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF0F172A)
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    label = { Text("Jobs") },
                    icon = { Text("📋") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    label = { Text("Inventory") },
                    icon = { Text("📦") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    label = { Text("Techs") },
                    icon = { Text("👥") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    label = { Text("Insights") },
                    icon = { Text("📊") }
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFF080B11))
                .padding(16.dp)
        ) {
            when (selectedTab) {
                0 -> JobCardKanbanScreen()
                1 -> InventoryScreen()
                2 -> EmployeesScreen()
                3 -> SalesInsightsScreen()
            }
        }
    }
}

@Composable
fun JobCardKanbanScreen() {
    Column {
        Text("Active Job Cards & Bay Pipeline", style = MaterialTheme.typography.titleLarge, color = Color.White)
        Spacer(modifier = Modifier.height(8.dp))
        Text("All changes write to local Room DB with instant UI response and outbox delta sync.", color = Color.Gray)
    }
}

@Composable
fun InventoryScreen() {
    Column {
        Text("Parts & Optical Barcode Scanner", style = MaterialTheme.typography.titleLarge, color = Color.White)
        Spacer(modifier = Modifier.height(8.dp))
        Text("CameraX + Google ML Kit barcode scanning integration.", color = Color.Gray)
    }
}

@Composable
fun EmployeesScreen() {
    Column {
        Text("Technician Bay Allocation & Clock Tracker", style = MaterialTheme.typography.titleLarge, color = Color.White)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Track actual vs book labor hours and bay efficiency.", color = Color.Gray)
    }
}

@Composable
fun SalesInsightsScreen() {
    Column {
        Text("Financial & Sales Margin Analytics", style = MaterialTheme.typography.titleLarge, color = Color.White)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Live ARO calculation and network revenue performance.", color = Color.Gray)
    }
}

@Composable
fun AutoPulseAppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFF06B6D4),
            secondary = Color(0xFFF59E0B),
            background = Color(0xFF080B11),
            surface = Color(0xFF0F172A)
        ),
        content = content
    )
}
