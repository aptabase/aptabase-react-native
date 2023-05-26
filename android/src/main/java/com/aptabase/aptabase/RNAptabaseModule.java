package com.aptabase.aptabase;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.content.pm.PackageManager;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import java.util.HashMap;
import java.util.Map;

public class RNAptabaseModule extends ReactContextBaseJavaModule {

	private final ReactApplicationContext reactContext;

	public RNAptabaseModule(ReactApplicationContext reactContext) {
		super(reactContext);
		this.reactContext = reactContext;
	}

	@Override
	public String getName() {
		return "RNAptabaseModule";
	}

	@Override
	public Map<String, Object> getConstants() {
		final Map<String, Object> constants = new HashMap<>();
		final PackageManager packageManager = this.reactContext.getPackageManager();
		final String packageName = this.reactContext.getPackageName();
		try {
			constants.put("appVersion", packageManager.getPackageInfo(packageName, 0).versionName);
			constants.put("appBuildNumber", packageManager.getPackageInfo(packageName, 0).versionCode);
		} catch (NameNotFoundException e) {
			e.printStackTrace();
		}
		return constants;
	}
}