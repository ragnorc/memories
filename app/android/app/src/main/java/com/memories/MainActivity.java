package com.memories;
import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.crashlytics.android.Crashlytics;
import io.fabric.sdk.android.Fabric;
import android.content.Intent;
import com.cboy.rn.splashscreen.SplashScreen;
public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);  // here
        Fabric.with(this, new Crashlytics());
        super.onCreate(savedInstanceState);
    }

    @Override
    protected String getMainComponentName() {
        return "Memories";
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }
}
