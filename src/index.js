const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chrome-aws-lambda");

exports.handler = async function (event, context) {
  let browser = null;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setContent(Buffer.from(event.body, 'base64').toString('utf8'), { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
    });

    // TODO: Response with PDF (or error if something went wrong )
    const response = {
      headers: {
        "Content-type": "application/pdf",
        "content-disposition": "attachment; filename=html-converted.pdf",
      },
      statusCode: 200,
      body: pdf.toString("base64"),
      isBase64Encoded: true,
    };
    context.succeed(response);
  } catch (error) {
    return context.fail(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
