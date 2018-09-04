// page_text_en_us.js
//
// Copyright(c)2006-2007 EnvisionWare, Inc. - All Rights Reserved
//
// Page Text for EnvisionWare OneStop
// Language = EN_US

// Common Words and Phrases
var txtCommon_CheckOut = "Wypożycz";
var txtCommon_CheckIn = "Zwróć";
var txtCommon_CheckInMaterials = txtCommon_CheckIn + " Materiały";
var txtCommon_Error = "Błąd";
var txtCommon_ErrorDescription = "Opis błędu:";
var txtCommon_StartOver = "Rozpocznij od nowa";
var txtCommon_ReturnToCheckOut = "powrót do wypożyczania";
var txtCommon_Next = "Dalej";
var txtCommon_PleaseWaitProcessing = "Proszę czekać ... Przetwarzanie";
var txtCommon_PleaseSeeStaff = "Proszę zwrócić się o pomoc do personelu.";
var txtCommon_StaffAssistanceRequired = "Wymagana pomoc personelu";
var txtCommon_UnableToProcessDescription = "System wypożyczania samoobsługowego nie może przetworzyć żądania.  Proszę spróbować później lub skontaktować się z personelem w celu uzyskania pomocy.";
var txtCommon_ItemTitle = "Tytuł";
var txtCommon_ItemDueDate = "Termin";
var txtCommon_PrintingReceipt = "drukowanie pokwitowania...";
var txtCommon_ThisItem = "Ta pozycja";
var txtCommon_Seconds = "sekund(y)";
var txtCommon_All = "Wszystko";
var txtCommon_Finished = "zakończono";
var txtCommon_PrintReceipt = "Pokwitowanie";
var txtCommon_TryAgain = "Spróbuj Ponownie";
var txtCommon_Done = "Wykonano";
var txtCommon_Help = "Zwróć się o pomoc";
var txtCommon_CancelHelp = "anuluj pomoc";
var txtCommon_ChangeLanguage = "Zmień język";

//Page Header
var txtPageHeader_MainMenuHeader = "MENU GŁÓWNE";
var txtPageHeader_CheckOutHeader = txtCommon_CheckOut.toUpperCase();
var txtPageHeader_CheckInHeader = txtCommon_CheckIn.toUpperCase();
var txtPageHeader_StaffMenuHeader = "MENU PERSONELU";
var txtPageHeader_IRSHeader = "Stanowisko zwrotów inteligentnych";
var txtPageHeader_ErrorHeader = txtCommon_Error.toUpperCase();
var txtPageHeader_LibraryProgramScheduleHeader = "Harmonogram programu bibliotecznego";
var txtPageHeader_LibraryProgramScheduleNoEvents = "Brak zdarzeń w harmonogramie";

// Menu Page Text
var txtMenuPage_Checkout = "Wypożycz materiały";
var txtMenuPage_Checkin = txtCommon_CheckInMaterials;
var txtMenuPage_PayFines = "Wyświetl i zapłać kary";
var txtMenuPage_PrintRelease = "Zwolnij zadania drukowania";
var txtMenuPage_ReservePC = "Zarezerwuj komputer";
var txtMenuPage_MakeDeposit = "Dokonaj wpłaty na konto biblioteczne";
var txtMenuPage_StaffFunctions = "Funkcje personelu";

// Enter User Id Page
var txtEnterUserIdPage_Instructions = "Proszę zeskanować kartę biblioteczną lub wpisać numer:";
var txtEnterUserIdPage_StartOver =  txtCommon_StartOver;
var txtEnterUserIdPage_Next = txtCommon_Next;
var txtEnterUserIdPage_Seconds = txtCommon_Seconds;
var txtEnterUserIdPage_PleaseWaitProcessing = txtCommon_PleaseWaitProcessing;
var txtEnterUserIdPage_OtherOptions = "Inne opcje";

// Enter User Pin Page
var txtEnterUserPinPage_Instructions = "Wprowadź PIN do swojego konta:";
var txtEnterUserPinPage_Next = txtCommon_Next;
var txtEnterUserPinPage_PleaseWaitProcessing = txtCommon_PleaseWaitProcessing;
var txtEnterUserPinPage_Seconds = txtCommon_Seconds;

// Keypad
var txtKeypad_Backspace = "BKSP";
var txtKeypad_Clear = "CLR";

// My Account Page
var txtMyAccountPage_AccountSummaryHeader = "Stan konta bibliotecznego";
var txtMyAccountPage_AccountSummaryTitle = "Poniżej znajduje się podsumowanie bieżącego konta bibliotecznego";
var txtMyAccountPage_Name = "Imię i nazwisko:";
var txtMyAccountPage_Address = "Adres:";
var txtMyAccountPage_FeeOwed = "Kary / opłaty";
var txtMyAccountPage_PayFeeOwed = "Naciśnij, aby zapłacić kary";
var txtMyAccountPage_CurrencySymbol = "$";
var txtMyAccountPage_Status = "Stan:";
var txtMyAccountPage_Holds = "Zawieszone";
var txtMyAccountPage_ChargedItems = "Pozycje Wypożyczone";
var txtMyAccountPage_OverdueItems = "Pozycje po terminie";
var txtMyAccountPage_StartOver = txtCommon_StartOver;
var txtMyAccountPage_ReturnToCheckOut = "Rozpocznij " + txtCommon_CheckOut;
var txtMyAccountPage_Seconds = txtCommon_Seconds;
var txtMyAccountPage_Renew = "Przedłuż";
var txtMyAccountPage_View = "Naciśnij, aby wyświetlić";
var txtMyAccountPage_ViewOrRenew = "Naciśnij, aby wyświetlić / przedłużyć";
var txtMyAccountPage_RenewAll = "Przedłuż Wszystkie";
var txtMyAccountPage_Close = "Zamknij";
var txtMyAccountPage_Renewed = "Przedłużono";
var txtMyAccountPage_RenewFailed = "Przedłużenie nie powiodło się";
var txtMyAccountPage_Displaying = "Wyświetlanie";
var txtMyAccountPage_Of = "z";
var txtMyAccountPage_CheckedOutItems = "Wypożyczone pozycje";
var txtMyAccountPage_Fine = "Kara";
var txtMyAccountPage_HoldItems = "Pozycje zawieszone";
var txtMyAccountPage_ItemTitle = txtCommon_ItemTitle;
var txtMyAccountPage_ItemDueDate = txtCommon_ItemDueDate;
var txtMyAccountPage_ItemMediaType = "Rodzaj nośnika";
var txtMyAccountPage_Done = txtCommon_Done;
var txtMyAccountPage_Ok = "ok";
var txtMyAccountPage_Error = txtCommon_Error;
var txtMyAccountPage_NoCheckOutNoRenewErrorMessage = "Wypożyczanie nowych pozycji i przedłużanie wypożyczonych pozycji na Twoim koncie jest aktualnie zablokowane przez system zarządzania biblioteki. Proszę zwrócić się o pomoc do personelu.";
var txtMyAccountPage_NoCheckOutErrorMessage = "Wypożyczanie nowych pozycji na Twoim koncie jest aktualnie zablokowane przez system zarządzania biblioteki. Proszę zwrócić się o pomoc do personelu.";
var txtMyAccountPage_NoRenewErrorMessage = "Przedłużanie aktualnie wypożyczonych pozycji na Twoim koncie jest aktualnie zablokowane przez system zarządzania biblioteki. Proszę zwrócić się o pomoc do personelu.";

// Scan Items Page
var txtScanItemsPage_Instructions = "Proszę umieścić każdy element pod skanerem, kodem kreskowym ku górze";
var txtScanItemsPage_RFIDInstructions = "Proszę położyć pozycje na stole.";
var txtScanItemsPage_MyAccount = "Moje Konto";
var txtScanItemsPage_Finished = txtCommon_Finished;
var txtScanItemsPage_StartOver = txtCommon_StartOver;
var txtScanItemsPage_PleaseWaitProcessing = txtCommon_PleaseWaitProcessing;
var txtScanItemsPage_PrintReceipt = txtCommon_PrintReceipt;
var txtScanItemsPage_Done = txtCommon_Done;
var txtScanItemsPage_Seconds = txtCommon_Seconds;
var txtScanItemsPage_CheckoutListTitleHeader = "Tytuł pozycji";
var txtScanItemsPage_CirculationListTitleUnavailable = "Tytuł niedostępny";
var txtScanItemsPage_CirculationListTitleError = txtCommon_Error;
var txtScanItemsPage_CheckoutListItemIDHeader = "ID pozycji";
var txtScanItemsPage_CheckoutListDueDateHeader = "Termin";
var txtScanItemsPage_CheckoutListStatusHeader = "Stan wypożyczenia";
var txtScanItemsPage_CheckedOutBadgeLabel = "Wypożyczono";
var txtScanItemsPage_NotCheckedOutBadgeLabel = "Nie wypożyczono";
var txtScanItemsPage_RepositionBadgeLabel = "Zmień pozycję";
var txtScanItemsPage_CheckedOutStatus = "OK";
var txtScanItemsPage_RepositionStatus = "Zmień pozycję";
var txtScanItemsPage_NotCheckedOutStatus = "Wypożyczenie nie powiodło się";
var txtScanItemsPage_RenewedStatus = "Przedłużono";
var txtScanItemsPage_NotRenewedStatus = "Przedłużenie nie powiodło się";

///////////////// Need translation
var txtScanItemsPage_CheckoutFeeOwed = "&nbsp;Fee<br/>Press to Accept";
var txtScanItemsPage_CheckoutFeeNoticeTitle = "Fee Notice";
var txtScanItemsPage_CheckoutFeeNotice = "A <span id=\'checkout_fee_amount\'></span> fee will be added to your account for checking out the following item:"
var txtScanItemsPage_CheckoutFeeOk = "OK";
var txtScanItemsPage_CheckoutFeeCancel = "Cancel";
var txtScanItemsPage_CheckoutFeeNoticePrompt = "Press " + txtScanItemsPage_CheckoutFeeOk + " to accept the fee and finish checking out the item or press " + txtScanItemsPage_CheckoutFeeCancel;
//////////////////////////////////


// Error Page Text
var txtErrorPage_UnableToProcessTitle = "Nie można przetworzyć żądania";
var txtErrorPage_UnableToProcessDescription = txtCommon_UnableToProcessDescription;
var txtErrorPage_ErrorDescription = txtCommon_ErrorDescription;
var txtErrorPage_StartOver = txtCommon_StartOver;
var txtErrorPage_Seconds = txtCommon_Seconds;

// Ils Error Page Text
var txtIlsErrorPage_CommunicationFailure = "Błąd komunikacji";
var txtIlsErrorPage_IlsUnavailable = "System wypożyczania samoobsługowego jest tymczasowo niedostępny z powodu błędu komunikacji systemu.  Proszę spróbować później lub skontaktować się z personelem w celu uzyskania pomocy.";
var txtIlsErrorPage_StartOver = txtCommon_StartOver;
var txtIlsErrorPage_Seconds = txtCommon_Seconds;

// Invalid User Error Page Text
var txtInvalidUserErrorPage_InvalidUserTitle = "Nieprawidłowy numer kodu kreskowego lub ID użytkownika";
var txtInvalidUserErrorPage_InvalidUserDescription = "Nie znaleziono wprowadzonego numeru kodu kreskowego lub ID użytkownika w systemie zarządzania biblioteką.  Proszę spróbować ponownie lub zwrócić się o pomoc do personelu.";
var txtInvalidUserErrorPage_StartOver = txtCommon_StartOver;
var txtInvalidUserErrorPage_Seconds = txtCommon_Seconds;

// Lost Card Error Page Text
var txtLostCardErrorPage_LostCardTitle = "Karta zgłoszona jako zgubiona";
var txtLostCardErrorPage_LostCardDescription = "Ta karta biblioteczna została zgłoszona jako zgubiona.  Proszę zwrócić kartę personelowi.<p></p>Dziękujemy za współpracę.";
var txtLostCardErrorPage_StartOver = txtCommon_StartOver;
var txtLostCardErrorPage_Seconds = txtCommon_Seconds;

// Check Out Error Page
var txtCheckOutErrorPage_UnableToProcessTitle = "Nie można wypożyczyć pozycji";
var txtCheckOutErrorPage_ThisItem = txtCommon_ThisItem;
var txtCheckOutErrorPage_UnableToProcessDescription = "wypożyczenie pozycji za pomocą stanowiska samoobsługowego było niemożliwe, ponieważ mogą istnieć ograniczenia dotyczące obiegu.";
var txtCheckOutErrorPage_PleaseSeeStaff = "Proszę zakończyć sesję, zabrać pozycję i skontaktować się z personelem w celu uzyskania pomocy.";
var txtCheckOutErrorPage_ErrorDescription = "Kod przyczyny z bazy danych pozycji:";
var txtCheckOutErrorPage_ReturnToCheckOut = txtCommon_ReturnToCheckOut;
var txtCheckOutErrorPage_Seconds = txtCommon_Seconds;

// Check In Page Text
var txtCheckInPage_RFIDInstructions = "Proszę położyć pozycje na stole.";
var txtCheckInPage_Instructions = "Proszę umieścić każdy element pod skanerem,<br/>kodem kreskowym ku górze.";
var txtCheckInPage_StartOver = txtCommon_StartOver;
var txtCheckInPage_Finished = "Zakończono";
var txtCheckInPage_PleaseWaitProcessing = txtCommon_PleaseWaitProcessing;
var txtCheckInPage_Done = txtCommon_Done;
var txtCheckInPage_PrintReceipt = txtCommon_PrintReceipt;
var txtCheckInPage_Seconds = txtCommon_Seconds;
var txtCheckinPage_CheckinListTitleHeader = "Tytuł pozycji";
var txtCheckinPage_CheckinListItemIDHeader = "ID pozycji";
var txtCheckinPage_CheckinListStatusHeader = "Stan zwrotu";
var txtCheckinPage_CheckedInBadgeLabel = "Zwrócono";
var txtCheckinPage_NotCheckedInBadgeLabel = "Nie zwrócono";
var txtCheckinPage_RepositionBadgeLabel = "Zmień pozycję";

// Check In Error Page
var txtCheckInErrorPage_UnableToProcessTitle = "Nie można zwrócić pozycji";
var txtCheckInErrorPage_UnableToProcessDescription = txtCommon_UnableToProcessDescription;
var txtCheckInErrorPage_ErrorDescription = txtCommon_ErrorDescription;
var txtCheckInErrorPage_ReturnToCheckIn = "Powrót do zwracania";
var txtCheckInErrorPage_Seconds = txtCommon_Seconds;

// Load Escrow Page Text
var txtLoadEscrowPage_InstructionsTitle = "Aby załadować depozyt, należy:";
var txtLoadEscrowPage_Done = txtCommon_Done;
var txtLoadEscrowPage_Instructions = "Wprowadzić monety przez odpowiedni otwór na monety w górnej części urządzenia. Po zakończeniu nacisnąć przycisk „" + txtLoadEscrowPage_Done + "”.";

// Reconcile Cash Page Text
var txtReconcileCashPage_Header = "Bilansuj gotówkę";
var txtReconcileCashPage_Instructions = "W przypadku pobierania pieniędzy z pojemnika na monety i podajnika banknotów należy zaznaczyć to pole. Jeżeli użytkownik chce otrzymać tylko raport dotyczący kwoty pieniędzy w urządzeniu i NIE będzie pobierał pieniędzy, pole to należy pozostawić niezaznaczone.<p></p>";
var txtReconcileCashPage_EmptyCashBoxPrompt = "Będę pobierać pieniądze z pojemnika na monety i podajnika banknotów.";
var txtReconcileCashPage_PrintReport = "drukuj raport bilansowania gotówki";
var txtReconcileCashPage_Cancel = "anuluj";

// Staff Menu Page Text
var txtStaffMenuPage_ShowDesktop = "Dostęp do pulpitu";
var txtStaffMenuPage_ReturnToMainPage = "Powrót do strony głównej";
var txtStaffMenuPage_ViewStats = "Wyświetl statystyki";
var txtStaffMenuPage_LoadEscrow = "Załaduj depozyt";
var txtStaffMenuPage_ReconcileCash = "Bilansuj gotówkę";
var txtStaffMenuPage_PrinterStatus = "Drukarka - ";
var txtStaffMenuPage_PendingAlert = "Przetwarzaj alerty oczekujące";

// Enter Staff Password Page
var txtEnterStaffPinPage_Instructions = "Proszę wprowadzić hasło personelu poniżej";
var txtEnterStaffPinPage_StartOver = txtCommon_StartOver;
var txtEnterStaffPinPage_Next = txtCommon_Next;
var txtEnterStaffPinPage_PleaseWaitProcessing = txtCommon_PleaseWaitProcessing;
var txtEnterStaffPinPage_Seconds = txtCommon_Seconds;

// Bad Password Text
var txtBadPasswordPage_InvalidStaffTitle = "Nieprawidłowe hasło personelu";
var txtBadPasswordPage_InvalidStaffDescription = "Nieprawidłowe hasło personelu. Proszę spróbować ponownie.";
var txtBadPasswordPage_StartOver = txtCommon_StartOver;
var txtBadPasswordPage_Seconds = txtCommon_Seconds;
var txtBadPasswordPage_TryAgain = txtCommon_TryAgain;

// Enter view Statistics Parameter Page Text
var txtEnterViewStatisticsParamsPage_Instructions = "Kryteria dla statystyk obiegu";
var txtEnterViewStatisticsParamsPage_fromDateLabel = "Od daty ";
var txtEnterViewStatisticsParamsPage_toDateLabel = "Do daty ";
var txtEnterViewStatisticsParamsPage_transTypeLabel = "Rodzaj transakcji";
var txtEnterViewStatisticsParamsPage_PleaseWaitProcessing = txtCommon_PleaseWaitProcessing;
var txtEnterViewStatisticsParamsPage_transTypeAll = txtCommon_All;
var txtEnterViewStatisticsParamsPage_transTypeCheckout = "Wypożycz";
var txtEnterViewStatisticsParamsPage_transTypeCheckin = "Zwróć";
var txtEnterViewStatisticsParamsPage_transTypeRenewal = "Przedłużenia";
var txtEnterViewStatisticsParamsPage_statusLabel = "Stan transakcji";
var txtEnterViewStatisticsParamsPage_statusFailed = "Niepowodzenie";
var txtEnterViewStatisticsParamsPage_statusSuccess = "Powodzenie";
var txtEnterViewStatisticsParamsPage_mediaTypeLabel = "Rodzaje nośnika ";
var txtEnterViewStatisticsParamsPage_mediaTypeAll = txtCommon_All;
var txtEnterViewStatisticsParamsPage_mediaType000 = "Inne";
var txtEnterViewStatisticsParamsPage_mediaType001 = "Książka";
var txtEnterViewStatisticsParamsPage_mediaType002 = "Magazyn";
var txtEnterViewStatisticsParamsPage_mediaType003 = "Oprawiony dziennik";
var txtEnterViewStatisticsParamsPage_mediaType004 = "Taśma audio";
var txtEnterViewStatisticsParamsPage_mediaType005 = "Taśma wideo";
var txtEnterViewStatisticsParamsPage_mediaType006 = "Dysk CD/CD-ROM";
var txtEnterViewStatisticsParamsPage_mediaType007 = "Dyskietka";
var txtEnterViewStatisticsParamsPage_mediaType008 = "Książka z dyskietką";
var txtEnterViewStatisticsParamsPage_mediaType009 = "Książka z dyskiem CD";
var txtEnterViewStatisticsParamsPage_mediaType010 = "Książka z taśmą audio";
var txtEnterViewStatisticsParamsPage_StartOver = txtCommon_StartOver;
var txtEnterViewStatisticsParamsPage_Next = "wyświetl raport";
var txtEnterViewStatisticsParamsPage_PleaseWaitProcessing = txtCommon_PleaseWaitProcessing;
var txtViewStatisticsPage_ReportTitle = "Statystyki obiegu";
var txtViewStatisticsPage_StartOver = txtCommon_StartOver;
var txtViewStatisticsPage_NewReport = "nowy raport";
var txtViewStatisticsPage_PrintReport = "drukuj raport";
var txtEnterViewStatistics_InvalidDateMessage = "Wprowadzona wartość „od daty” musi być wcześniejsza lub równa wartości „do daty”. Proszę poprawić i ponowić próbę";

// Calendar Text
var txtCalendar_day1 = "Niedziela";
var txtCalendar_day2 = "Poniedziałek";
var txtCalendar_day3 = "Wtorek";
var txtCalendar_day4 = "Środa";
var txtCalendar_day5 = "Czwartek";
var txtCalendar_day6 = "Piątek";
var txtCalendar_day7 = "Sobota";
var txtCalendar_day1_sh = "Nd";
var txtCalendar_day2_sh = "Pn";
var txtCalendar_day3_sh = "Wt";
var txtCalendar_day4_sh = "Śr";
var txtCalendar_day5_sh = "Cz";
var txtCalendar_day6_sh = "Pi";
var txtCalendar_day7_sh = "So";
var txtCalendar_Month1_sh = "Sty";
var txtCalendar_Month2_sh = "Lu";
var txtCalendar_Month3_sh = "Mar";
var txtCalendar_Month4_sh = "Kwi";
var txtCalendar_Month5_sh = "Maj";
var txtCalendar_Month6_sh = "Cze";
var txtCalendar_Month7_sh = "Lip";
var txtCalendar_Month8_sh = "Sie";
var txtCalendar_Month9_sh = "Wrz";
var txtCalendar_Month10_sh = "Paź";
var txtCalendar_Month11_sh = "Lis";
var txtCalendar_Month12_sh = "Gru";
var txtCalendar_Month1 = "Styczeń";
var txtCalendar_Month2 = "Luty";
var txtCalendar_Month3 = "Marzec";
var txtCalendar_Month4 = "Kwiecień";
var txtCalendar_Month5 = "Maj";
var txtCalendar_Month6 = "Czerwiec";
var txtCalendar_Month7 = "Lipiec";
var txtCalendar_Month8 = "Sierpień";
var txtCalendar_Month9 = "Wrzesień";
var txtCalendar_Month10 = "Październik";
var txtCalendar_Month11 = "Listopad";
var txtCalendar_Month12 = "Grudzień";
var txtCalendar_Monthup_title = "Przejdź do następnego miesiąca";
var txtCalendar_Monthdn_title = "Przejdź do poprzedniego miesiąca";
var txtCalendar_Clearbtn_caption = "Wyczyść";
var txtCalendar_Clearbtn_title = "Kasuje daty wybrane w kalendarzu.";
var txtCalendar_Maxrange_caption = "Jest to zakres maksymalny";

// Intelligent Return Main Page:
var txtIntReturnPage_Title = "";
var txtIntReturnPage_NumOfCKI    = "Zwroty:";
var txtIntReturnPage_NumOfHolds  = "Zawieszone:";
var txtIntReturnPage_NumOfTransits  = "Przekazania:";
var txtIntReturnPage_NumOfErrors = "Błędy:";
var txtIntReturnPage_SwapBin = "Zmień zasobnik";

// Intelligent Return Swap Bin Page:
var txtIntReturnSwapBinPage_PrintReportFor    = "Drukuj raport dla:";
var txtIntReturnSwapBinPage_RptCKI  = "Zwroty";
var txtIntReturnSwapBinPage_RptHold  = "Zawieszone";
var txtIntReturnSwapBinPage_RptTransit  = "Przekazania";
var txtIntReturnSwapBinPage_RptError  = "Błędy";
var txtIntReturnSwapBinPage_PrintSlipFor = "Drukuj odcinki dla:";
var txtIntReturnSwapBinPage_SlipCKI  = "Zwroty";
var txtIntReturnSwapBinPage_SlipHold = "Zawieszone";
var txtIntReturnSwapBinPage_SlipTransit  = "Przekazania";
var txtIntReturnSwapBinPage_SlipError  = "Błędy";
var txtIntReturnSwapBinPage_PleaseWaitProcessing = txtCommon_PleaseWaitProcessing;
var txtIntReturnSwapBinPage_Resume = "Wznowienie";

// Printer Error Page:
var txtPrintErrorPage_ErrorMsg = "Nie można wydrukować pokwitowania"
var txtPrintErrorPage_Seconds = txtCommon_Seconds;
var txtPrintErrorPage_PrinterProblem = "Drukarka nie jest gotowa. Proszę skontaktować się z personelem.";
var txtPrintErrorPage_PleaseSeeStaff = txtCommon_PleaseSeeStaff;
var txtPrintErrorPage_Return = txtCommon_StartOver;

// Printer Error Prompt Page:
var txtPrintErrorPromptPage_ErrorMsg = "Ostrzeżenie drukarki";
var txtPrintErrorPromptPage_Return = txtCommon_StartOver;
var txtPrintErrorPromptPage_Next = "dalej";
var txtPrintErrorPromptPage_Seconds = txtCommon_Seconds;
var txtPrintErrorPromptPage_PrinterProblem = "Drukarka nie działa prawidłowo.";
var txtPrintErrorPromptPage_PleaseSeeStaff = "Można kliknąć przycisk „Dalej”, aby podjąć próbę wypożyczenia bez drukowania pokwitowania lub skontaktować się z personelem w celu uzyskania pomocy.";

// Printer Error Prompt Checkin Page:
var txtPrintErrorPromptCheckinPage_ErrorMsg = txtPrintErrorPromptPage_ErrorMsg;
var txtPrintErrorPromptCheckinPage_Return = txtPrintErrorPromptPage_Return ;
var txtPrintErrorPromptCheckinPage_Next = txtPrintErrorPromptPage_Next ;
var txtPrintErrorPromptCheckinPage_PrinterProblem = txtPrintErrorPromptPage_PrinterProblem;
var txtPrintErrorPromptCheckinPage_PleaseSeeStaff = "Można kliknąć przycisk „Dalej”, aby podjąć próbę zwrotu bez drukowania pokwitowania lub skontaktować się z personelem w celu uzyskania pomocy.";

// Printer Error Page No Checkout Allowed
var txtPrinterErrorNoCheckoutPage_ErrorMsg = "Wypożyczanie niedostępne"
var txtPrinterErrorNoCheckoutPageOutOfPaperMsg = "W drukarce pokwitowań zabrakło papieru."
var txtPrinterErrorNoCheckoutPage_PleaseSeeStaff = txtCommon_PleaseSeeStaff;

// Printer Error Page No Checkin Allowed
var txtPrinterErrorNoCheckinPage_ErrorMsg = "Zwracanie niedostępne"
var txtPrinterErrorNoCheckinPageOutOfPaperMsg = txtPrinterErrorNoCheckoutPageOutOfPaperMsg;
var txtPrinterErrorNoCheckinPage_Return = txtCommon_StartOver;
var txtPrinterErrorNoCheckinPage_PleaseSeeStaff = txtCommon_PleaseSeeStaff;

// Printeer Status Page
var txtPrinterStatusPage_Paused = "Wstrzymano";
var txtPrinterStatusPage_Error = "Błąd";
var txtPrinterStatusPage_Pending_Deletion = "Oczekiwanie na usunięcie";
var txtPrinterStatusPage_Paper_Jam = "Zacięcie papieru";
var txtPrinterStatusPage_PaperOut = "Brak papieru";
var txtPrinterStatusPage_Manual_Feed = "Podawanie ręczne";
var txtPrinterStatusPage_Paper_Problem = "Problem z papierem";
var txtPrinterStatusPage_Offline = "Offline";
var txtPrinterStatusPage_IO_Active = "Aktywne wej./wyj.";
var txtPrinterStatusPage_Busy = "Zajęte";
var txtPrinterStatusPage_Printing = "Drukowanie";
var txtPrinterStatusPage_Output_Bin_Full = "Zasobnik wyjściowy zapełniony";
var txtPrinterStatusPage_Not_Available = "Drukarka niedostępna";
var txtPrinterStatusPage_Waiting = "Oczekiwanie";
var txtPrinterStatusPage_Processing = "Przetwarzanie";
var txtPrinterStatusPage_Initializing = "Inicjowanie";
var txtPrinterStatusPage_Warming_Up = "Rozgrzewanie";
var txtPrinterStatusPage_Toner_Low = "Niski poziom tonera";
var txtPrinterStatusPage_No_Toner = "Brak tonera";
var txtPrinterStatusPage_Page_Punt = "Strona wysłana";
var txtPrinterStatusPage_User_Intervention = "Interwencja użytkownika";
var txtPrinterStatusPage_Out_Of_Memory = "Brak pamięci";
var txtPrinterStatusPage_Door_Open = "Drzwi otwarte";
var txtPrinterStatusPage_Server_Unknown = "Serwer nieznany";
var txtPrinterStatusPage_Power_Save = "Oszczędzanie energii";
var txtPrinterStatusPage_Normal = "Normalne";

// Printer Receipt Page
var txtPrintReceiptOptionsPage_receiptModeQuestion = "Opcje pokwitowania";
var txtPrintReceiptOptionsPage_receiptModePrint = "Drukuj";
var txtPrintReceiptOptionsPage_receiptModeEmail = "E-mail";
var txtPrintReceiptOptionsPage_receiptModePrintEmail = "Obydwie";
var txtPrintReceiptOptionsPage_receiptModeNone = "Brak";
var txtPrintReceiptOptionsPage_provideEmailAddress = "Proszę podać swój adres e-mail:";
var txtPrintReceiptOptionsPage_buttonGo = "Wyślij";
var txtPrintReceiptOptionsPage_Seconds = txtCommon_Seconds;

// Input String Page
var txtInputStringPage_title = "Proszę wprowadzić:"
var txtInputStringPage_buttonOk = "Wyślij";
var txtInputStringPage_buttonCancel = "anuluj";

// Pending Alert Page
var txtPendAlertPage_Instruction = "Alerty oczekujące";
var txtPendAlertPage_ButtonStartOver = txtCommon_StartOver;
var txtPendAlertPage_AlertIlsOffline = "alert oświadczenia offline ILS";
var txtPendAlertPage_AlertPrinterDown = "alert oświadczenia o wyłączeniu drukarki";
var txtPendAlertPage_AlertRequestHelp = "rozwiąż alert żądania pomocy";
var txtPendAlertPage_noPendingAlerts  = "nie występują żadne oczekujące alerty dla tego urządzenia";

// Email Subject Page
var txtCheckinReceiptEmailSubject = "pokwitowanie zwrotu do biblioteki";
var txtCheckoutReceiptEmailSubject = "pokwitowanie wypożyczenia z biblioteki";