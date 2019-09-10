USE [BisselCentre]
GO

/****** Object:  Table [dbo].[Donation]    Script Date: 2019-09-10 12:04:15 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Donation](
	[DonationID] [int] IDENTITY(1,1) NOT NULL,
	[Date] [date] NOT NULL,
	[FName] [varchar](255) NULL,
	[LName] [varchar](255) NULL,
	[Email] [varchar](255) NULL,
	[Phone] [varchar](255) NULL,
	[Company] [varchar](255) NULL,
	[Description] [varchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DonationID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

