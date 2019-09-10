USE [BisselCentre]
GO

/****** Object:  Table [dbo].[Users]    Script Date: 2019-09-10 12:05:37 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Users](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[FName] [varchar](255) NOT NULL,
	[LName] [varchar](255) NOT NULL,
	[Phone] [varchar](255) NOT NULL,
	[Email] [varchar](255) NOT NULL,
	[Password] [varchar](255) NOT NULL,
	[Admin] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

