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

        private string[] Centers = new string[] { "Puretipalli", "Kalavalla" };
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
            Session["Center"] = Session["Center"] ?? Centers[0];
            ViewBag.Center = Session["Center"];
            var rates = DbContext.Rates.OrderByDescending(x => x.CreatedOn).FirstOrDefault();
            ViewBag.Centers = new SelectList(Centers, Session["Center"] as string);
            ViewBag.Rate = rates?.Rate ?? 0;
            ViewBag.IncentiveRate = rates?.IncentiveRate ?? 0;
            ViewBag.PremiumRate = rates?.PremiumRate ?? 0;
            return View();
        }

        [HttpPost]
        public ActionResult ChangeCenter(string center)
        {
            if(Centers.Contains(center))
            {
                Session["Center"] = center;
            }
            return RedirectToAction("Index");
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
            request.Headers.Add("Center", Session["Center"] as string);
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
