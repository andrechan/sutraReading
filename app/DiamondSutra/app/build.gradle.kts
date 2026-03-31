import java.io.File

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.andrechan.diamondsutra"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.andrechan.diamondsutra"
        minSdk = 24
        targetSdk = 35
        versionCode = 4
        versionName = "1.3"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

val renameDebugApk = tasks.register("renameDebugApk") {
    group = "build"
    description = "Rename debug APK to DiamondSutra.apk"
    doLast {
        val debugDir = layout.buildDirectory.dir("outputs/apk/debug").get().asFile
        val from = File(debugDir, "app-debug.apk")
        val to = File(debugDir, "DiamondSutra.apk")
        if (!from.exists()) {
            logger.warn("renameDebugApk: {} not found, skipping", from)
            return@doLast
        }
        if (to.exists()) {
            check(to.delete()) { "Could not delete existing $to" }
        }
        check(from.renameTo(to)) { "Could not rename $from to $to" }
    }
}

afterEvaluate {
    tasks.named("assembleDebug") {
        finalizedBy(renameDebugApk)
    }
}

tasks.register<Copy>("syncWebAssets") {
    val envPath = System.getenv("DIAMONDSUTRA_WEB_ROOT")
    val webRoot =
        if (!envPath.isNullOrBlank() && File(envPath).isDirectory) File(envPath)
        else rootProject.file("../../DiamondSutra")
    from(webRoot)
    into(layout.projectDirectory.dir("src/main/assets/www"))
    include("**/*.html", "**/*.js", "**/*.css")
}

tasks.named("preBuild") {
    dependsOn("syncWebAssets")
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.activity:activity-ktx:1.9.3")
}
