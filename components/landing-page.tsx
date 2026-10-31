"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Check, CheckCircle2, ChefHat, ChevronRight, MapPin, QrCode, ShoppingBag, Ticket, Utensils } from "lucide-react";
import { Brand, Credits } from "./common";
import "./landing-page.css";

const pickupStages = [
  { title: "Order received", description: "Your order is with the kitchen.", korean: "주문 접수", action: "조리 시작해 보기" },
  { title: "Freshly cooking", description: "Enjoy the festival nearby while we cook.", korean: "조리 중", action: "준비 완료해 보기" },
  { title: "Your food is ready!", description: "Show this number at booth B-07.", korean: "픽업 가능", action: "처음부터 다시 보기" },
];

export default function LandingPage() {
  const [menuLanguage, setMenuLanguage] = useState<"en" | "ko">("en");
  const [stage, setStage] = useState(0);
  useEffect(() => { document.documentElement.lang = "ko"; }, []);
  const status = pickupStages[stage];

  return <div className="landing" id="top">
    <a className="landing-skip" href="#main">본문으로 바로가기</a>
    <header className="landing-header">
      <div className="landing-wrap landing-header-inner">
        <Brand/>
        <nav aria-label="서비스 소개">
          <a href="#vendors">사장님께</a>
          <a href="#travelers">여행자에게</a>
          <a href="#journey">이용 흐름</a>
        </nav>
        <a className="landing-button landing-button-dark landing-header-cta" href="#try">직접 체험<ArrowUp size={16} className="landing-arrow-diagonal"/></a>
      </div>
    </header>

    <main id="main">
      <section className="landing-hero landing-wrap" aria-labelledby="hero-title">
        <div className="landing-hero-copy">
          <h1 id="hero-title">말은 달라도,<br/>축제의 맛은<br/><span>함께.</span></h1>
          <p>작은 축제 부스와 세계의 여행자를 잇는<br className="landing-desktop-break"/> QR 음식 주문 서비스, BoothBites.</p>
          <div className="landing-actions">
            <a className="landing-button landing-button-dark" href="#try">주문부터 픽업까지 체험하기<ArrowRight size={18}/></a>
            <a className="landing-text-link" href="#why">어떤 서비스인가요?<ArrowDown size={16}/></a>
          </div>
        </div>
        <figure className="landing-hero-visual">
          <div className="landing-hero-photo"><img src="/images/tteokbokki.jpg" alt="매콤한 소스에 담긴 떡볶이" width={960} height={720} fetchPriority="high"/></div>
          <div className="landing-dish-caption"><div><span lang="en">A little bite of Korea.</span><strong>떡볶이 <span lang="en">Tteokbokki</span></strong></div><Utensils size={23}/></div>
          <div className="landing-hero-ticket" aria-label="픽업 티켓 화면 예시, 주문번호 024">
            <div><Ticket size={16}/><span lang="en">PICK UP AT B-07</span></div>
            <strong>024</strong>
            <p><CheckCircle2 size={16}/><span lang="en">Ready to enjoy.</span></p>
          </div>
          <figcaption>메뉴와 픽업 티켓 화면 예시</figcaption>
        </figure>
        <div className="landing-hero-bottom"><span>앱 설치 없이</span><span>한국어·영어 메뉴</span><span>주문은 모바일로, 수령은 부스에서</span><a href="#why" aria-label="서비스 이야기로 내려가기"><ArrowDown size={21}/></a></div>
      </section>

      <section className="landing-context landing-wrap" id="why" aria-labelledby="why-title">
        <h2 id="why-title">축제를 즐기러 왔는데,<br/>주문 앞에서 멈추지 않도록.</h2>
        <div className="landing-context-copy">
          <p>사장님은 음식을 만들다 주문을 받고,<br/>여행자는 낯선 메뉴 앞에서 말을 고릅니다.</p>
          <p>BoothBites는 그 사이에 QR 하나를 놓습니다.<br/>메뉴를 이해하는 순간부터, 음식을 받는 순간까지.</p>
        </div>
      </section>

      <section className="landing-vendors" id="vendors" aria-labelledby="vendors-title">
        <div className="landing-wrap landing-feature-grid">
          <div className="landing-feature-copy">
            <h2 id="vendors-title">사장님은<br/>요리에 더 집중하세요.</h2>
            <p>짧게 열리는 축제 부스에 맞춰,<br/>메뉴 준비도 주문 관리도 한 화면에서.</p>
            <dl className="landing-benefits">
              <div><dt>메뉴판을 온라인 메뉴로</dt><dd>메뉴명·가격·설명을 확인해 공개하면 부스 전용 QR 안내판을 만들 수 있어요.</dd></div>
              <div><dt>영어 주문도 한국어로 접수</dt><dd>손님이 영어로 고른 음식이 사장님 화면에는 한국어 주문으로 도착해요.</dd></div>
              <div><dt>부스 상황에 맞게 접수 조절</dt><dd>남은 수량, 품절, 접수 중단을 관리하고 주문별로 조리·준비 상태를 바꿔요.</dd></div>
            </dl>
            <a className="landing-text-link" href="/studio">사장님 스튜디오 열기<ArrowRight size={18}/></a>
          </div>
          <figure className="landing-vendor-example">
            <div className="landing-example-heading"><span>소풍 분식</span><span>화면 예시</span></div>
            <div className="landing-menu-sheet">
              <h3>오늘의 메뉴</h3>
              <div><span>떡볶이<small lang="en">Tteokbokki</small></span><strong>₩5,000</strong></div>
              <div><span>닭강정<small lang="en">Sweet & crispy chicken</small></span><strong>₩7,000</strong></div>
              <div><span>호떡<small lang="en">Sweet Korean pancake</small></span><strong>₩3,000</strong></div>
              <p><Check size={16}/>확인한 메뉴 공개<ChevronRight size={15}/><QrCode size={17}/>부스 QR</p>
            </div>
            <div className="landing-kitchen-example">
              <div className="landing-kitchen-title"><ChefHat size={21}/><h3>새 주문이 들어왔어요</h3></div>
              <div className="landing-kitchen-line"><strong>#024</strong><span>영어로 주문한 손님</span></div>
              <p><span>떡볶이</span><strong>1개</strong></p>
              <p><span>호떡</span><strong>2개</strong></p>
              <div className="landing-kitchen-states"><span>접수</span><ChevronRight size={15}/><span>조리</span><ChevronRight size={15}/><span>준비 완료</span></div>
            </div>
            <figcaption>설명과 가격은 예시입니다. 실제 메뉴는 사장님이 확인해 공개합니다.</figcaption>
          </figure>
        </div>
      </section>

      <section className="landing-travelers landing-wrap landing-feature-grid" id="travelers" aria-labelledby="travelers-title">
        <div className="landing-traveler-example">
          <div className="landing-menu-language"><span>메뉴 언어를 바꿔보세요</span><div role="group" aria-label="예시 메뉴 언어"><button aria-pressed={menuLanguage === "ko"} onClick={() => setMenuLanguage("ko")}>한국어</button><button aria-pressed={menuLanguage === "en"} onClick={() => setMenuLanguage("en")}>English</button></div></div>
          <div className="landing-sample-food" lang={menuLanguage} aria-live="polite">
            <img src="/images/hotteok.jpg" alt={menuLanguage === "en" ? "A golden Korean sweet pancake" : "노릇하게 구운 호떡"} width={960} height={640} loading="lazy"/>
            <div><span>{menuLanguage === "en" ? "A festival favorite" : "축제에서 만나는 달콤함"}</span><h3>{menuLanguage === "en" ? "Sweet Korean pancake" : "달콤한 호떡"}</h3><p>{menuLanguage === "en" ? "Golden outside, warm and sweet inside." : "노릇한 겉면 안에 따뜻하고 달콤한 속을 담았어요."}</p><div><span>{menuLanguage === "en" ? "1 piece" : "1개"}</span><strong>₩3,000</strong></div></div>
          </div>
          <div className={`landing-live-ticket ${stage === 2 ? "landing-ticket-ready" : ""}`}>
            <div className="landing-ticket-number"><Ticket size={20}/><span>024</span><small lang="en">B-07</small></div>
            <div className="landing-ticket-message" aria-live="polite" aria-atomic="true"><h3 lang="en">{status.title}</h3><p lang="en">{status.description}</p><span>{status.korean}</span></div>
          </div>
          <div className="landing-example-controls"><span>픽업 상태 화면 예시</span><button onClick={() => setStage((stage + 1) % pickupStages.length)}>{status.action}<ArrowRight size={16}/></button></div>
        </div>
        <div className="landing-feature-copy">
          <h2 id="travelers-title">여행자는<br/>한 입 더 가까이.</h2>
          <p>한국어로 주문할 말을 찾는 대신,<br/>먹고 싶은 음식을 고르면 되니까.</p>
          <dl className="landing-benefits">
            <div><dt>낯선 음식도 알아보고 선택</dt><dd>사진, 한·영 설명, 가격과 판매 단위를 보고 골라요. 원재료는 판매자가 확인한 정보만 표시해요.</dd></div>
            <div><dt>앱 설치 없이 QR로 주문</dt><dd>휴대폰 카메라로 부스 QR을 열고, 메뉴와 수량을 선택해 주문을 마쳐요.</dd></div>
            <div><dt>주문한 뒤에는 픽업 상태 확인</dt><dd>페이지를 열어두면 접수·조리·준비 상태가 갱신돼요. 준비되면 부스에서 주문번호를 보여주세요.</dd></div>
          </dl>
          <a className="landing-text-link" href="/demo">손님 화면에서 주문해 보기<ArrowRight size={18}/></a>
        </div>
      </section>

      <section className="landing-journey landing-wrap" id="journey" aria-labelledby="journey-title">
        <div className="landing-section-heading"><h2 id="journey-title">QR 하나로 이어지는<br/>한 끼의 여정.</h2><p>사장님의 메뉴가 손님의 주문으로,<br/>그 주문이 다시 따뜻한 음식으로.</p></div>
        <ol className="landing-journey-steps">
          <li><div><span>1</span><Utensils size={25}/></div><h3>메뉴를 준비하고</h3><p>사장님이 메뉴와 가격을<br/>확인해 공개해요.</p></li>
          <li><div><span>2</span><QrCode size={25}/></div><h3>부스 QR을 열고</h3><p>손님이 앱 설치 없이<br/>메뉴를 살펴봐요.</p></li>
          <li><div><span>3</span><ShoppingBag size={25}/></div><h3>내 언어로 주문하고</h3><p>음식과 수량을 고른 뒤<br/>모의 결제로 체험해요.</p></li>
          <li><div><span>4</span><MapPin size={25}/></div><h3>번호를 보여주면 끝</h3><p>준비 완료를 확인하고<br/>부스에서 받아요.</p></li>
        </ol>
      </section>

      <section className="landing-try" id="try" aria-labelledby="try-title">
        <div className="landing-wrap landing-try-inner">
          <div><h2 id="try-title">이제, 두 화면을<br/>직접 연결해 보세요.</h2><p>사장님 화면에서 손님 화면을 열어 주문해 보세요.<br/>하나의 주문이 접수부터 픽업까지 이어집니다.</p></div>
          <div className="landing-try-actions">
            <a className="landing-button landing-button-dark" href="/studio">사장님으로 시작하기<ArrowRight size={19}/></a>
            <a className="landing-button landing-button-outline" href="/demo">손님으로 주문해 보기<ArrowRight size={19}/></a>
            <p>실제 결제 없는 체험 데모입니다.</p>
          </div>
          <details className="landing-demo-details"><summary>데모에서 확인할 수 있는 범위</summary><p>메뉴 공개, QR 안내판, 한·영 주문, 조리·픽업 상태를 체험할 수 있습니다. 결제는 모의 결제이며 실제 카드 정보를 받지 않습니다. 사진으로 메뉴를 읽는 AI 기능은 API 연결 후 사용할 수 있습니다. 상태 갱신은 페이지가 열려 있을 때 동작합니다. 예시 메뉴·부스는 시연용입니다.</p></details>
        </div>
      </section>
    </main>

    <div className="landing-footer landing-wrap"><div className="landing-footer-top"><Brand/><p>작은 부스에서 시작되는, 더 넓은 축제.</p><a href="#top">맨 위로<ArrowUp size={16}/></a></div><Credits lang="ko"/></div>
  </div>;
}
