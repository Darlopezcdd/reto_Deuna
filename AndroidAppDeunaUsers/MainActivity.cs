using Android.App;
using Android.OS;
using Android.Webkit;

namespace AppDeunaUsers;

[Activity(Label = "Deuna", MainLauncher = true, Theme = "@android:style/Theme.NoTitleBar")]
public class MainActivity : Activity
{
    protected override void OnCreate(Bundle? savedInstanceState)
    {
        base.OnCreate(savedInstanceState);

        // Set our view from the "main" layout resource
        SetContentView(Resource.Layout.activity_main);

        WebView webView = FindViewById<WebView>(Resource.Id.webView)!;
        webView.Settings.JavaScriptEnabled = true;
        webView.Settings.DomStorageEnabled = true;
        
        // Cargar el archivo index.html desde la carpeta Assets
        webView.LoadUrl("file:///android_asset/index.html");
    }
}