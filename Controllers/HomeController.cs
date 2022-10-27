using System.Configuration;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace DairyCenter.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }


        public async Task<string> Api(string route)
        {
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
