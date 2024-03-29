﻿using System.Web.Mvc;
using System.Web.Routing;

namespace DairyCenter
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
            routes.MapRoute(
                name: "Api",
                url: "Home/api/{*route}",
                defaults: new { controller = "Home", action = "Api", route = UrlParameter.Optional }
            );
        }
    }
}
