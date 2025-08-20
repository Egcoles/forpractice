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
        public int? RejectedBy { get; set; }
        public DateTime? EndorsedDate { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public DateTime? RejectedDate { get; set; }
        public string? RejectRemarks { get; set; }
        public string Status { get; set; } = "On-GOING";
        public DateTime EntryDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdateDAte { get; set; } = DateTime.UtcNow;
        public int CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
        public string Notification { get; set; } = "VIEW";
        public string FormStatus { get; set; } = "FOR ENDORSEMENT";
        public int ItemId { get; set; }
        public string ItemDescription { get; set; } = string.Empty;
        public int Qty { get; set; }
        public int? Supplier1 { get; set; }
        public int? Supplier2 { get; set; }
        public int? Supplier3 { get; set; }
        public decimal? Supplier1_PRICE { get; set; }
        public decimal? Supplier2_PRICE { get; set; }
        public decimal? Supplier3_PRICE { get; set; }
        public decimal? Supplier1_TOTAL { get; set; }
        public decimal? Supplier2_TOTAL { get; set; }
        public decimal? Supplier3_TOTAL { get; set; }

        
    }

    public class PRGRID
    {
        public int PRId { get; set; }
        public string? PRNumber { get; set; }
        public string? PRRefferenceNo { get; set; }
        public string? ProjecDescription { get; set; }
        public DateTime DateNeeded { get; set; }
        public int CanvassedBy { get; set; }
        public int EndorserId { get; set; }
        public int? ApproverId { get; set; }
        public string? FormStatus { get; set; }
        public DateTime EntryDate { get; set; } = DateTime.UtcNow;
        public int ItemId { get; set; }
        public string ItemDescription { get; set; } = string.Empty;
        public int Qty { get; set; }
        public int Supplier1 { get; set; }
        public int Supplier2 { get; set; }
        public int Supplier3 { get; set; }
        public int Supplier1_PRICE { get; set; }
        public int Supplier2_PRICE { get; set; }
        public int Supplier3_PRICE { get; set; }
        public int Supplier1_TOTAL { get; set; }
        public int Supplier2_TOTAL { get; set; }
        public int Supplier3_TOTAL { get; set; }

        // Formatted date property
        public string FormattedEntryDate => EntryDate.ToUniversalTime().ToString("MM/dd/yy");
    }
}