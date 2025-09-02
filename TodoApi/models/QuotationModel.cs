using System.Text.Json.Serialization;
namespace TodoApi.Models
{
    public class CompanyModel
    {
        public int CompanyID { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class LocationModel
    {
        public int LocationID { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class QuotationModel
    {
        public int QuotationID { get; set; }
        public string ReferenceNo { get; set; } = string.Empty;
        public string ControlNo { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public int CompanyID { get; set; }
        public int LocationID { get; set; }
        public string Terms { get; set; } = string.Empty;
        public string VAT { get; set; } = string.Empty;
        public int Discount { get; set; }
        public int SubmittedBy { get; set; }
        public int Endorser { get; set; }
        public int Apporver { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public int CreatedBy { get; set; }
        public decimal OverAllTotal { get; set; }
        public decimal GrandTotalVat { get; set; }
        public string FormattedDate => CreatedDate.ToString("MM/dd/yy");
        public List<QuotationGridModel> Items { get; set; } = new List<QuotationGridModel>();
    }

    public class QuotationGridModel
    {
        public int QuotationGridID { get; set; }
        public int QuotationID { get; set; }
        public int ItemID { get; set; }
        public string ItemDescription { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitCost { get; set; }
        public int Markup { get; set; }
        public decimal TotalCost { get; set; }
       
    }
}