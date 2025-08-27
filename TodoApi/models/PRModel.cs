using System.Text.Json.Serialization;
namespace TodoApi.Models
{
    public class PRModel
    {
        public int? UserId { get; set; }
        public int PRId { get; set; }
        public string? PRNumber { get; set; }
        public string? PRRefferenceNo { get; set; }
        public string? ProjecDescription { get; set; }
        public DateTime DateNeeded { get; set; }
        public int CanvassedBy { get; set; }
        public int EndorserId { get; set; }
        public int? ApproverId { get; set; }
        public string Status { get; set; } = "On-GOING";
        public DateTime EntryDate { get; set; } = DateTime.UtcNow;
        public int CreatedBy { get; set; }
        public string Notification { get; set; } = "VIEW";
        public string FormStatus { get; set; } = "FOR ENDORSEMENT";
        public List<ItemModel>? Items { get; set; } = new List<ItemModel>();

    }

    public class ItemModel
    {
        public int PRGRID_Id { get; set; }
        public int PRId { get; set; } // Foreign key to PRModel
        public int ItemId { get; set; }
        public string ItemDescription { get; set; } = string.Empty;
        public int Qty { get; set; }
        public List<PRSupplier>? Suppliers { get; set; } = new List<PRSupplier>();
    }
    public class PRSupplier
    {
        public int PRSupplierId { get; set; }
        public int PRGRID_Id { get; set; }
        public int? SupplierId { get; set; }
        public decimal? Price { get; set; }
        public decimal? Total { get; set; }
    }

    public class PRGRID
    {
        public int PRId { get; set; }
        public string? PRNumber { get; set; }
        public string? PRRefferenceNo { get; set; }
        public string? ProjecDescription { get; set; }
        public string? FormStatus { get; set; }
        public DateTime EntryDate { get; set; } = DateTime.UtcNow;
        public string FormattedEntryDate => EntryDate.ToUniversalTime().ToString("MM/dd/yy");
    }

    public class PRDetails
    {
        public int  PRId { get; set; }
        public int PRGRID_ID { get; set; }
        public string? PRNumber { get; set; }
        public string? ProjecDescription { get; set; }
        public DateTime DateNeeded { get; set; }
        public string? CanvassedBy_Name { get; set; }
        public string? Endorser_Name { get; set; }
        public string? Approver_Name { get; set; }
        public DateTime EntryDate { get; set; } = DateTime.UtcNow;
        public string FormattedEntryDate => EntryDate.ToUniversalTime().ToString("MM/dd/yy");
         public List<Item> Items { get; set; } = new List<Item>();
    }
    
    public class Item
    {
        public int ItemID { get; set; }
        public string ? ItemDescription { get; set; }
        public int Qty { get; set; }
        public string ? Unit { get; set; }
        public string ? SupplierName { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }
    }
}