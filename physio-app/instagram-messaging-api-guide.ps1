$ErrorActionPreference = 'Stop'

$outputPath = Join-Path (Get-Location) 'Instagram-Messaging-API-Guide.docx'
if (Test-Path $outputPath) { Remove-Item $outputPath -Force }

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()
$sel = $word.Selection

# wdColor constants
$wdAlignParagraphLeft = 0
$wdStyleHeading1 = -2
$wdStyleHeading2 = -3
$wdStyleHeading3 = -4
$wdStyleNormal = -1

function Add-Heading($text, $level) {
    $styleId = switch ($level) { 1 { $wdStyleHeading1 } 2 { $wdStyleHeading2 } 3 { $wdStyleHeading3 } }
    $sel.Style = $doc.Styles.Item($styleId)
    $sel.TypeText($text)
    $sel.TypeParagraph()
    $sel.Style = $doc.Styles.Item($wdStyleNormal)
}

function Add-Para($text) {
    $sel.Style = $doc.Styles.Item($wdStyleNormal)
    $sel.TypeText($text)
    $sel.TypeParagraph()
}

function Add-Bullet($text) {
    $sel.Style = $doc.Styles.Item($wdStyleNormal)
    $sel.Range.ListFormat.ApplyBulletDefault()
    $sel.TypeText($text)
    $sel.TypeParagraph()
    $sel.Range.ListFormat.RemoveNumbers()
}

function Add-Code($code) {
    $sel.Style = $doc.Styles.Item($wdStyleNormal)
    $sel.Font.Name = 'Consolas'
    $sel.Font.Size = 10
    $sel.ParagraphFormat.LeftIndent = 18
    $sel.Shading.BackgroundPatternColor = 15921906  # light gray
    $sel.TypeText($code)
    $sel.TypeParagraph()
    $sel.Font.Name = 'Calibri'
    $sel.Font.Size = 11
    $sel.ParagraphFormat.LeftIndent = 0
    $sel.Shading.BackgroundPatternColor = -16777216  # auto
}

# ===== TITLE =====
$sel.Style = $doc.Styles.Item(-63)  # Title style
$sel.TypeText('Full Setup Guide: Instagram Messaging API (C#)')
$sel.TypeParagraph()

# ===== INTRO =====
Add-Para 'This document walks through the complete process from zero to sending an automated Instagram DM from a C# application using the Meta Graph API.'

# ===== PART 1 =====
Add-Heading 'Part 1: Prerequisites (one-time account setup)' 1

Add-Heading '1.1 Convert Instagram to Business/Creator account' 2
Add-Bullet 'Open Instagram mobile app -> Settings -> Account type and tools -> Switch to professional account.'
Add-Bullet 'Choose Business (recommended) or Creator.'

Add-Heading '1.2 Create a Facebook Page' 2
Add-Bullet 'Go to https://www.facebook.com/pages/create'
Add-Bullet 'Any category works; this Page is what Meta uses as the "anchor" for messaging.'

Add-Heading '1.3 Connect Instagram to the Facebook Page' 2
Add-Bullet 'Open the Facebook Page -> Settings -> Linked accounts -> Instagram -> Connect account.'
Add-Bullet 'Log in with the IG business account.'

# ===== PART 2 =====
Add-Heading 'Part 2: Create a Meta Developer App' 1

Add-Heading '2.1 Register as a developer' 2
Add-Bullet 'Go to https://developers.facebook.com/ -> My Apps -> Create App.'
Add-Bullet 'Use case: Other -> Type: Business.'
Add-Bullet 'Give it a name, contact email -> Create.'

Add-Heading '2.2 Add the Instagram product' 2
Add-Bullet 'In the App Dashboard sidebar -> Add Product -> find Instagram -> Set up.'
Add-Bullet 'This adds the Instagram Graph API (for Business messaging).'

Add-Heading '2.3 Note your App ID and App Secret' 2
Add-Bullet 'Dashboard -> Settings -> Basic.'
Add-Bullet 'Copy App ID and App Secret (you will need these).'

# ===== PART 3 =====
Add-Heading 'Part 3: Get IG_BUSINESS_ACCOUNT_ID and PAGE_ACCESS_TOKEN' 1

Add-Heading '3.1 Open Graph API Explorer' 2
Add-Bullet 'Go to https://developers.facebook.com/tools/explorer/'
Add-Bullet 'Top right: select your app from the Meta App dropdown.'
Add-Bullet 'User or Page dropdown -> Get User Access Token.'

Add-Heading '3.2 Grant permissions' 2
Add-Para 'Click "Add a Permission" and check all of these:'
Add-Bullet 'pages_show_list'
Add-Bullet 'pages_read_engagement'
Add-Bullet 'pages_manage_metadata'
Add-Bullet 'pages_messaging'
Add-Bullet 'instagram_basic'
Add-Bullet 'instagram_manage_messages'
Add-Bullet 'business_management'
Add-Para 'Click Generate Access Token -> log in -> approve.'

Add-Heading '3.3 Get your Page ID and Page Access Token' 2
Add-Para 'In Graph API Explorer, run this GET request:'
Add-Code 'me/accounts'
Add-Para 'Response looks like:'
Add-Code @'
{
  "data": [{
    "access_token": "EAAG...",   <-- THIS is PAGE_ACCESS_TOKEN
    "id": "1234567890",          <-- Facebook Page ID
    "name": "My Page"
  }]
}
'@

Add-Heading '3.4 Get the Instagram Business Account ID' 2
Add-Para 'Run this GET request (replace {page-id}):'
Add-Code '{page-id}?fields=instagram_business_account'
Add-Para 'Response:'
Add-Code @'
{
  "instagram_business_account": { "id": "17841400000000000" },  <-- IG_BUSINESS_ACCOUNT_ID
  "id": "1234567890"
}
'@

Add-Heading '3.5 Make the Page Access Token long-lived' 2
Add-Para 'The token from step 3.3 expires in about 1 hour. Exchange it:'
Add-Code @'
GET https://graph.facebook.com/v21.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={APP_ID}
  &client_secret={APP_SECRET}
  &fb_exchange_token={SHORT_LIVED_USER_TOKEN}
'@
Add-Para 'Then call me/accounts again with the new long-lived user token. The returned page token will be non-expiring (as long as the password is unchanged).'

# ===== PART 4 =====
Add-Heading 'Part 4: Get RECIPIENT_IGSID (via Webhook)' 1
Add-Para 'You cannot just look up a user IGSID - Meta only gives it to you when the user messages you first.'

Add-Heading '4.1 Stand up a webhook endpoint in C#' 2
Add-Para 'You need a public HTTPS URL. For local dev, use ngrok: ngrok http 5000'
Add-Para 'Minimal ASP.NET Core webhook:'
Add-Code @'
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

const string VERIFY_TOKEN = "my_random_verify_string_123";

// GET: Meta calls this once to verify your endpoint
app.MapGet("/webhook", ([FromQuery(Name = "hub.mode")] string mode,
                        [FromQuery(Name = "hub.verify_token")] string token,
                        [FromQuery(Name = "hub.challenge")] string challenge) =>
{
    if (mode == "subscribe" && token == VERIFY_TOKEN)
        return Results.Text(challenge);
    return Results.Forbid();
});

// POST: every incoming IG message hits this
app.MapPost("/webhook", async (HttpRequest req) =>
{
    using var reader = new StreamReader(req.Body);
    var body = await reader.ReadToEndAsync();
    Console.WriteLine(body);   // inspect, look for sender.id (the IGSID)
    return Results.Ok();
});

app.Run();
'@

Add-Heading '4.2 Register the webhook in Meta App Dashboard' 2
Add-Bullet 'App Dashboard -> Webhooks -> Instagram -> Subscribe.'
Add-Bullet 'Callback URL: https://your-ngrok-url/webhook'
Add-Bullet 'Verify Token: my_random_verify_string_123 (must match code).'
Add-Bullet 'Subscribe to fields: messages, messaging_postbacks.'

Add-Heading '4.3 Subscribe the Page to the app' 2
Add-Code @'
POST https://graph.facebook.com/v21.0/{page-id}/subscribed_apps
  ?subscribed_fields=messages
  &access_token={PAGE_ACCESS_TOKEN}
'@

Add-Heading '4.4 Trigger a test message' 2
Add-Para 'From another Instagram account, send a DM to your business IG account. Your webhook should receive:'
Add-Code @'
{
  "entry": [{
    "messaging": [{
      "sender":    { "id": "1789..." },   <-- RECIPIENT_IGSID (save this!)
      "recipient": { "id": "1784..." },
      "message":   { "text": "hi" }
    }]
  }]
}
'@
Add-Para 'Persist sender.id to a database keyed by user. That is the IGSID you pass to the send-message endpoint.'

# ===== PART 5 =====
Add-Heading 'Part 5: Send the message' 1
Add-Para 'You now have all three values. Send a DM with this C# code:'
Add-Code @'
using System.Net.Http;
using System.Net.Http.Json;

var http = new HttpClient();
var pageId = "YOUR_IG_BUSINESS_ACCOUNT_ID";
var accessToken = "PAGE_ACCESS_TOKEN";

var payload = new {
    recipient = new { id = "RECIPIENT_IGSID" },
    message   = new { text = "Hello from C#!" }
};

var url = $"https://graph.facebook.com/v21.0/{pageId}/messages?access_token={accessToken}";
var response = await http.PostAsJsonAsync(url, payload);
var body = await response.Content.ReadAsStringAsync();
Console.WriteLine(body);
'@

# ===== PART 6 =====
Add-Heading 'Part 6: Going to production' 1
Add-Para 'While your app is in Development Mode, you can only message accounts that are admins/testers of the app (add them under App Dashboard -> App Roles -> Roles).'
Add-Para 'To message real users you must:'
Add-Bullet 'Complete Business Verification (App Dashboard -> Settings -> Basic -> Verify business).'
Add-Bullet 'Submit App Review for instagram_manage_messages and related permissions. Meta requires a screencast of your use case and a privacy policy URL.'

# ===== QUICK REFERENCE =====
Add-Heading 'Quick Reference: Where each value comes from' 1

$table = $doc.Tables.Add($sel.Range, 5, 2)
$table.Borders.Enable = $true
$table.Cell(1,1).Range.Text = 'Value'
$table.Cell(1,2).Range.Text = 'Source'
$table.Cell(2,1).Range.Text = 'APP_ID, APP_SECRET'
$table.Cell(2,2).Range.Text = 'App Dashboard -> Settings -> Basic'
$table.Cell(3,1).Range.Text = 'PAGE_ACCESS_TOKEN'
$table.Cell(3,2).Range.Text = 'Graph API Explorer -> me/accounts (then exchange to long-lived)'
$table.Cell(4,1).Range.Text = 'IG_BUSINESS_ACCOUNT_ID'
$table.Cell(4,2).Range.Text = '{page-id}?fields=instagram_business_account'
$table.Cell(5,1).Range.Text = 'RECIPIENT_IGSID'
$table.Cell(5,2).Range.Text = 'Webhook sender.id field from incoming message'

# Header row formatting
$table.Rows.Item(1).Range.Bold = $true

# Move cursor past table
$sel.EndKey(6) | Out-Null  # wdStory = 6
$sel.TypeParagraph()

Add-Heading 'Important constraints' 1
Add-Bullet '24-hour messaging window: you can only message a user who messaged you first within the last 24 hours.'
Add-Bullet 'Outside the 24-hour window, only approved message tags (e.g. HUMAN_AGENT) are allowed.'
Add-Bullet 'No cold/unsolicited DMs - Meta will ban the app.'
Add-Bullet 'Personal Instagram accounts are not supported.'

Add-Heading 'Official documentation' 1
Add-Bullet 'https://developers.facebook.com/docs/messenger-platform/instagram'
Add-Bullet 'https://developers.facebook.com/docs/instagram-api/guides/messaging'

# Save and close
$wdFormatDocumentDefault = 16
$doc.SaveAs2($outputPath, $wdFormatDocumentDefault)
$doc.Close()
$word.Quit()

[System.Runtime.Interopservices.Marshal]::ReleaseComObject($sel) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($doc) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
[GC]::Collect()
[GC]::WaitForPendingFinalizers()

Write-Output "Created: $outputPath"
