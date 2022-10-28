using DairyCenter.Models;
using Microsoft.AspNet.Identity.Owin;
using System.Configuration;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Web;
using System.Linq;

namespace DairyCenter.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private ApplicationDbContext _context;
        public ApplicationDbContext DbContext
        {
            get
            {
                return _context ?? HttpContext.GetOwinContext().Get<ApplicationDbContext>();
            }
            private set
            {
                _context = value;
            }
        }

        public HomeController()
        {
        }

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        public ActionResult Index()
        {
            var rates = DbContext.Rates.OrderByDescending(x => x.CreatedOn).FirstOrDefault();
            ViewBag.Rate = rates?.Rate ?? 0;
            ViewBag.IncentiveRate = rates?.IncentiveRate ?? 0;
            ViewBag.PremiumRate = rates?.PremiumRate ?? 0;
            return View();
        }

        public async Task<string> Api(string route)
        {
            route = route.Replace("/XXXXX", "");  // Remove slug added to support routes ending with .* 
            var http = new HttpClient();
            var apiAuth = ConfigurationManager.AppSettings["API_SECRET_HEADER"];
            var endpoint = ConfigurationManager.AppSettings["API_EndPoint"];
            var url = $"{endpoint}/api/{route}";
            var request = new HttpRequestMessage(new HttpMethod(Request.HttpMethod), url);
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiAuth);
            switch (request.Method.Method.ToUpper())
            {
                case "POST":
                case "PUT":
                    Stream req = Request.InputStream;
                    req.Seek(0, SeekOrigin.Begin);
                    string json = new StreamReader(req).ReadToEnd();
                    request.Content = new StringContent(json ?? string.Empty, Encoding.UTF8, "application/json");
                    break;
                default:
                    break;
            }
            var response = await http.SendAsync(request);
            var result = await response.Content.ReadAsStringAsync();
            return result;
        }
    }
}
