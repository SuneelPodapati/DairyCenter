﻿using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(DairyCenter.Startup))]

namespace DairyCenter
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
