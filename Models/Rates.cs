using System;
using System.ComponentModel.DataAnnotations;

namespace DairyCenter.Models
{
    public class Rates
    {
        public Rates()
        {
            Id = Guid.NewGuid().ToString();
        }

        [Key]
        public string Id { get; set; }

        [Required]
        [Range(0.1, double.MaxValue)]
        public double Rate { get; set; }

        [Required]
        [Range(0.1, double.MaxValue)]
        [Display(Name = "Incentive Rate")]
        public double IncentiveRate { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        [Display(Name = "Premium Rate")]
        public double PremiumRate { get; set; }



        [Display(Name = "Last updated on")]
        public DateTime CreatedOn { get; set; }


        [Display(Name = "Last updated by")]
        public string CreatedBy { get; set; }
    }

}