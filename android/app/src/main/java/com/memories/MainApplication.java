package com.memories;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.auth0.react.A0Auth0Package;
import com.cmcewen.blurview.BlurViewPackage;
import com.geektime.rnonesignalandroid.ReactNativeOneSignalPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.actionsheet.ActionSheetPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.smixx.fabric.FabricPackage;
import com.microsoft.codepush.react.CodePush;
import com.react.rnspinkit.RNSpinkitPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.cboy.rn.splashscreen.SplashScreenReactPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.airbnb.android.react.lottie.LottiePackage;
import com.airbnb.android.react.lottie.LottiePackage;
import com.brentvatne.react.ReactVideoPackage;
import com.arttitude360.reactnative.rngoogleplaces.RNGooglePlacesPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    @Override
    protected String getJSBundleFile() {
      return CodePush.getJSBundleFile();
    }

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new A0Auth0Package(),
            new BlurViewPackage(),
            new ReactNativeOneSignalPackage(),
          
            new ActionSheetPackage(),
            
            new FastImageViewPackage(),
            new RNSoundPackage(),
            new FabricPackage(),
            new CodePush(getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey), getApplicationContext(), BuildConfig.DEBUG),
            new RNSpinkitPackage(),
            new RNFetchBlobPackage(),
            new SplashScreenReactPackage(),
            new MapsPackage(),
            new VectorIconsPackage(),
            new LottiePackage(),
            
            new ReactVideoPackage(),
            new RNGooglePlacesPackage(),
            new PickerPackage(),
              new FBSDKPackage(mCallbackManager),
             
            new LinearGradientPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }


    @Override
    public void onCreate() {
        super.onCreate();
        FacebookSdk.sdkInitialize(getApplicationContext());
        // If you want to use AppEventsLogger to log events.
        AppEventsLogger.activateApp(this);
    }
}
