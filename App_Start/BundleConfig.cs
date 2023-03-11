using System.Web.Optimization;

namespace DairyCenter
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/Content/css").Include(
                 "~/Content/bootstrap.css",
                 "~/Content/Site.css"));
            bundles.Add(new ScriptBundle("~/SPA").Include(
                 "~/App/dist/dairy-center/runtime.js",
                 "~/App/dist/dairy-center/polyfills.js",
                 "~/App/dist/dairy-center/main.js"));
        }
    }
}
