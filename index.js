const puppeteer = require("puppeteer");

const POSTS_PER_PAGE = 15;

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.goto("https://www.inmogames.com/SSI.php?ssi_function=login");

  await page.evaluate(() => {
    const userInput = document.querySelector("#user");
    const passwordInput = document.querySelector("#passwrd");
    const form = document.querySelector("form");

    userInput.value = "StreamBot";
    passwordInput.value = "BOT PASSWORD";

    form.submit();
  });

  await page.waitForNavigation();

  await page.goto("https://www.inmogames.com/index.php?action=post;board=9.0");

  await page.evaluate(() => {
    const subjectInput = document.querySelector("input[name=subject]");
    const bodyInput = document.querySelector("textarea[name=message]");
    const form = document.querySelector("#postmodify");
    const gobackInput = document.querySelector("#check_back");

    subjectInput.value = "Post automatico";
    bodyInput.value = "responde para ganar";
    gobackInput.checked = true;

    form.submit();
  });

  await page.waitForNavigation();

  const numero = Math.floor(Math.random() * 50);
  console.log(numero);

  const postUrl = page.url().replace(".new", "");
  const topicId = postUrl.replace(
    "https://www.inmogames.com/index.php?topic=",
    ""
  );
  const replyUrl = `https://www.inmogames.com/index.php?action=post;topic=${topicId}`;

  let numPages;
  let winner;

  do {
    numPages = await page.evaluate(() => {
      const navPagesList = document.querySelectorAll(".navPages");

      return navPagesList.length / 2;
    });

    console.log(numPages);

    for (let i = 0; i <= numPages; i++) {
      if (numPages === 0) {
        await page.reload();
      } else {
        await page.goto(`${postUrl}.${POSTS_PER_PAGE * i}`);
      }

      winner = await page.evaluate((numero) => {
        const allPosts = [...document.querySelectorAll(".post_wrapper")];

        for (const postElement of allPosts) {
          const textContainer = postElement.querySelector(".inner");
          const text = textContainer.innerText;

          const win = text.includes(String(numero));

          if (win) {
            return postElement.querySelector(".poster h4").innerText;
          }
        }
      }, numero);
    }

    if (!winner) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  } while (!winner);

  await page.goto(replyUrl);

  winner = winner.replace("\n", "").trim();

  await page.evaluate((winner) => {
    const bodyInput = document.querySelector("textarea[name=message]");
    const form = document.querySelector("#postmodify");
    const checkLockInput = document.querySelector("#check_lock");

    bodyInput.value = `El ganador es: @${winner}`;
    checkLockInput.checked = true;

    form.submit();
  }, winner);

  await browser.close();
}

main();
