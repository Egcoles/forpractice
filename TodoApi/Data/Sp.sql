USE [PRO_USER]
GO
/****** Object:  StoredProcedure [dbo].[sp_insert_PurchaseRequisition]    Script Date: 8/20/2025 4:20:49 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[sp_insert_PurchaseRequisition]  
    @ProjecDescription NVARCHAR(MAX),
    @DateNeeded DATETIME,
    @CanvassedBy INT,
    @EndorserId INT,
    @ApproverId INT,
    @EndorsedDate DATETIME,
    @ApprovedDate DATETIME,
    @Status NVARCHAR(MAX),
    @EntryDate DATETIME,
    @CreatedBy INT,
    @Notification NVARCHAR(MAX),
    @FormStatus NVARCHAR(MAX),
    @ItemId INT,--multiple item
    @ItemDescription NVARCHAR(MAX),
    @Qty INT,-- array
    @Supplier INT, -- array of supplier multiple
    @PRICE DECIMAL(18, 2), -- array of price based on supplier
    @TOTAL DECIMAL(18, 2) --aray
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check the count of unused reference numbers
        DECLARE @UnusedCount INT;
        DECLARE @Threshold INT = 5; 

        SELECT @UnusedCount = COUNT(*)
        FROM [dbo].[ReferenceNumberPool]
        WHERE IsUsed = 0;

        -- Generate reference numbers if the count is below the threshold
        IF @UnusedCount < @Threshold
        BEGIN
            EXEC dbo.GenerateReferenceDetailsProc 5; 
        END

        -- Variables for the generated control number and reference number
        DECLARE @PRNumber NVARCHAR(MAX);
        DECLARE @PRReferenceNo NVARCHAR(MAX);

        -- Call to get an unused reference number
        EXEC dbo.GetUnusedReferenceNumber @PRReferenceNo OUTPUT;
		
		SET @PRReferenceNo = 'PR' + @PRReferenceNo;  
		SET @PRNumber = RIGHT(@PRReferenceNo, LEN(@PRReferenceNo) - 2); 

        -- Variable to hold the newly inserted PR_ID
        DECLARE @NewPRId INT;

        -- Insert into the first table
        INSERT INTO [PRO_USER].[dbo].[PURCHASE_REQUISITION]
        (
            PR_NUMBER, --25-0002 (with no 'PR')
            PR_REFERENCENO, --25-0002 (with 'PR')
            PR_PROJECTDESC,
            PR_DATENEEDED,
            PR_CANVASSEDBY,
            PR_ENDORSER,
            PR_APPROVER,
            PR_ENDORSEDDATE,
            PR_APPROVEDDATE,
            PR_STATUS,
            PR_ENTRYDATE,
            PR_CREATEDBY,
            PR_NOTIFICATION,
            PR_FORMSTATUS
        )
        VALUES
        (
            @PRNumber,          
            @PRReferenceNo,    
            @ProjecDescription,
            @DateNeeded,
            @CanvassedBy,
            @EndorserId,
            @ApproverId,
            @EndorsedDate,
            @ApprovedDate,
            @Status,
            @EntryDate,
            @CreatedBy,
            @Notification,
            @FormStatus
        );

        -- Get the identity value of the newly inserted record
        SET @NewPRId = SCOPE_IDENTITY();

        -- Insert into the second table using the retrieved identity value
        INSERT INTO [PRO_USER].[dbo].[PR_GRID]
        (PRID,
         ITEMID,
         ITEM_DESCRIPTION,
         QTY,
         SUPPLIER,
         GRAND_TOTAL,
        PRICE)
        VALUES
        (
            @NewPRId,
            @ItemId,
            @ItemDescription,
            @Qty,
            @Supplier,
            @TOTAL,
            @PRICE
            
        );
		
		--delete after insertion
		EXEC dbo.DeleteUsedReferenceNumber  @PRNumber;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Rollback if there is an error
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Capture the error details
        DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
        SELECT  @ErrorMessage = ERROR_MESSAGE(),
                @ErrorSeverity = ERROR_SEVERITY(),
                @ErrorState = ERROR_STATE();

        -- Raise an error with the captured details
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END