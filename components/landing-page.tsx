"use client";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUp, Check, ChevronRight, Flower2, Play, Store, Ticket } from "lucide-react";
import { Credits } from "./common";
import "./landing-page.css";

const pickupStages = [
  { title: "Order received", description: "Your order is with the kitchen.", korean: "주문 접수", action: "조리 시작해 보기" },
  { title: "Freshly cooking", description: "Enjoy the festival nearby while we cook.", korean: "조리 중", action: "준비 완료해 보기" },
  { title: "Your food is ready!", description: "Show this number at booth B-07.", korean: "픽업 가능", action: "처음부터 다시 보기" },
];
const journey = [
  { image: "flow-menu", title: "메뉴 공개", description: <>사장님이 메뉴와 가격을<br/>확인해 공개해요.</> },
  { image: "flow-qr", title: "QR 주문", description: <>앱 설치 없이 메뉴를 보고<br/>내 언어로 주문해요.</> },
  { image: "flow-cook", title: "조리", description: <>손님의 주문이 부스에<br/>한국어로 도착해요.</> },
  { image: "flow-pickup", title: "픽업", description: <>준비 완료를 확인하고<br/>번호를 보여주면 끝.</> },
];
function PrintBrand() {
  return <a className="landing-brand" href="#top" aria-label="BoothBites 처음으로"><Store aria-hidden="true" strokeWidth={2.6}/><span>Booth<span>Bites</span></span></a>;
}
function Ornament() {
  return <div className="landing-ornament" aria-hidden="true"><span/><Flower2 size={23}/><span/></div>;
}
export default function LandingPage() {
  const [menuLanguage, setMenuLanguage] = useState<"en" | "ko">("ko");
  const [stage, setStage] = useState(0);
  useEffect(() => { document.documentElement.lang = "ko"; }, []);
  const status = pickupStages[stage];
  return <div className="landing" id="top">
    <a className="landing-skip" href="#main">본문으로 바로가기</a>
    <header className="landing-header"><div className="landing-header-inner">
      <PrintBrand/>
      <nav aria-label="서비스 소개"><a href="#vendors">사장님께</a><a href="#travelers">여행자에게</a><a href="#journey">이용 흐름</a><a href="#try">직접 체험</a></nav>
      <a className="landing-button landing-header-cta" href="#try">주문부터 픽업까지 체험하기<ArrowRight size={24}/></a>
    </div></header>
    <main id="main">
      <section className="landing-hero" aria-labelledby="hero-title">
        <img className="landing-festival-art" src="/images/print/festival.webp" alt="축제 부스 사장님이 여행자에게 따뜻한 떡볶이를 건네는 판화풍 일러스트" width={1834} height={858} fetchPriority="high"/>
        <div className="landing-hero-copy">
          <h1 id="hero-title"><span>말은 달라도,</span><span><em>축제의 맛은</em> 함께.</span></h1>
          <Ornament/>
          <p>작은 축제 부스와 세계의 여행자를 잇는<br className="landing-desktop-break"/> QR 음식 주문 서비스</p>
          <a className="landing-button landing-hero-cta" href="#try">주문부터 픽업까지 체험하기<ArrowRight size={25}/></a>
          <span className="landing-demo-note"><Play size={16} fill="currentColor" aria-hidden="true"/>체험 데모 · 실제 결제 없음</span>
        </div>
      </section>
      <section className="landing-flow landing-wrap" id="journey" aria-labelledby="journey-title">
        <div className="landing-flow-main">
          <h2 className="landing-band-title" id="journey-title"><Flower2 size={22} aria-hidden="true"/>이용 흐름<span aria-hidden="true"/></h2>
          <ol className="landing-steps">{journey.map((step,index) => <li key={step.image}>
            <img src={"/images/print/"+step.image+".webp"} width={130} height={120} alt=""/>
            <h3>{step.title}</h3><p>{step.description}</p>{index < 3 && <ArrowRight className="landing-step-arrow" size={23} aria-hidden="true"/>}
          </li>)}</ol>
        </div>
        <div className="landing-menu-preview">
          <h2 className="landing-band-title"><Flower2 size={22} aria-hidden="true"/>메뉴를 직접 돌려보세요<span aria-hidden="true"/></h2>
          <div className="landing-menu-sample">
            <img src="/images/print/food.webp" alt="붉은 그릇에 담긴 떡볶이 일러스트" width={208} height={203}/>
            <div className="landing-menu-sample-copy">
              <a className="landing-food-link" href="/demo" aria-label="떡볶이 주문 체험 열기"><div><strong>떡볶이</strong><span lang="en">Tteokbokki</span></div><ChevronRight size={27}/></a>
              <div className="landing-language" role="group" aria-label="예시 메뉴 언어"><button aria-pressed={menuLanguage === "ko"} onClick={() => setMenuLanguage("ko")}>한국어</button><button lang="en" aria-pressed={menuLanguage === "en"} onClick={() => setMenuLanguage("en")}>English</button></div>
              <p className="landing-menu-translation" lang={menuLanguage} aria-live="polite" aria-atomic="true">{menuLanguage === "ko" ? "쫄깃한 쌀떡과 매콤달콤한 소스." : "Chewy rice cakes in a sweet, spicy sauce."}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="landing-vendors" id="vendors" aria-labelledby="vendors-title"><div className="landing-wrap landing-vendor-grid">
        <div className="landing-feature-copy">
          <h2 id="vendors-title">사장님은 요리에<br className="landing-tablet-break"/> 더 집중하세요.</h2>
          <p className="landing-feature-intro">짧게 열리는 축제 부스에 맞춰,<br/>메뉴 준비도 주문 관리도 한 화면에서.</p>
          <dl className="landing-benefits">
            <div><dt>메뉴판을 온라인 메뉴로</dt><dd>메뉴명·가격·설명을 확인해 공개하면<br className="landing-desktop-break"/> 부스 전용 QR 안내판을 만들 수 있어요.</dd></div>
            <div><dt>영어 주문도 한국어로 접수</dt><dd>손님이 영어로 고른 음식이 사장님 화면에는<br className="landing-desktop-break"/> 한국어 주문으로 도착해요.</dd></div>
            <div><dt>부스 상황에 맞게 접수 조절</dt><dd>남은 수량, 품절, 접수 중단을 관리하고<br className="landing-desktop-break"/> 주문별로 조리·준비 상태를 바꿔요.</dd></div>
          </dl>
          <a className="landing-text-link" href="/studio">사장님 스튜디오 열기<ArrowRight size={20}/></a>
        </div>
        <div className="landing-vendor-proof">
          <img className="landing-vendor-art" src="/images/print/vendor-art.webp" width={1536} height={1024} alt="주문 화면 옆에서 요리에 집중하는 축제 부스 사장님" loading="lazy"/>
          <figure className="landing-order-sheet">
            <figcaption><Store size={18} aria-hidden="true"/><strong>소풍 분식</strong><span>주문 화면 예시</span></figcaption>
            <div className="landing-order-heading"><span>새 주문이 들어왔어요</span><strong>#024</strong></div>
            <div className="landing-order-row"><span>떡볶이 <small lang="en">Tteokbokki</small></span><span>1개</span><strong>₩5,000</strong></div>
            <div className="landing-order-row"><span>호떡 <small lang="en">Sweet Korean pancake</small></span><span>2개</span><strong>₩6,000</strong></div>
            <div className="landing-order-foot"><span>영어로 주문한 손님</span><span><Check size={16}/>한국어로 접수</span></div>
          </figure>
          <p className="landing-example-caption">설명과 가격은 예시입니다. 실제 메뉴는 사장님이 확인해 공개합니다.</p>
        </div>
      </div></section>
      <section className="landing-context landing-wrap" id="why" aria-labelledby="why-title">
        <Ornament/><h2 id="why-title">축제를 즐기러 왔는데,<br/><span>주문 앞에서 멈추지 않도록.</span></h2>
        <div className="landing-context-copy"><p>사장님은 음식을 만들다 주문을 받고,<br/>여행자는 낯선 메뉴 앞에서 말을 고릅니다.</p><p>BoothBites는 그 사이에 QR 하나를 놓습니다.<br/>메뉴를 이해하는 순간부터, 음식을 받는 순간까지.</p></div>
      </section>
      <section className="landing-travelers" id="travelers" aria-labelledby="travelers-title"><div className="landing-wrap landing-traveler-grid">
        <div className="landing-traveler-example">
          <div className="landing-food-story"><img src="/images/hotteok.jpg" alt="노릇하게 구운 달콤한 호떡" width={960} height={640} loading="lazy"/><div><h3>호떡<span lang="en">Sweet Korean pancake</span></h3><p lang="en">Golden outside,<br/>warm and sweet inside.</p><span>1개 · ₩3,000 <small>메뉴 예시</small></span></div></div>
          <div className={"landing-pickup "+(stage === 2 ? "landing-pickup-ready" : "")}>
            <div className="landing-pickup-top"><span><Ticket size={18} aria-hidden="true"/>픽업 티켓 예시</span><span lang="en">BOOTH B-07</span></div>
            <div className="landing-pickup-main"><strong className="landing-pickup-number">024</strong><div className="landing-pickup-message" aria-live="polite" aria-atomic="true"><h3 lang="en">{status.title}</h3><p lang="en">{status.description}</p><span>{status.korean}</span></div></div>
            <ol className="landing-pickup-progress" aria-label="픽업 진행 상태">{pickupStages.map((item,index) => <li key={item.korean} aria-current={index === stage ? "step" : undefined} className={index <= stage ? "is-reached" : ""}><span>{index < stage ? <Check size={14}/> : index+1}</span>{item.korean}</li>)}</ol>
            <button className="landing-pickup-control" onClick={() => setStage((current) => (current + 1) % pickupStages.length)}>{status.action}<ArrowRight size={18}/></button>
          </div>
        </div>
        <div className="landing-feature-copy">
          <h2 id="travelers-title">여행자는<br/>한 입 더 가까이.</h2>
          <p className="landing-feature-intro">한국어로 주문할 말을 찾는 대신,<br/>먹고 싶은 음식을 고르면 되니까.</p>
          <dl className="landing-benefits">
            <div><dt>낯선 음식도 알아보고 선택</dt><dd>사진, 한·영 설명, 가격과 판매 단위를 보고 골라요. 원재료는 판매자가 확인한 정보만 표시해요.</dd></div>
            <div><dt>앱 설치 없이 QR로 주문</dt><dd>휴대폰 카메라로 부스 QR을 열고, 메뉴와 수량을 선택해 주문을 마쳐요.</dd></div>
            <div><dt>주문한 뒤에는 픽업 상태 확인</dt><dd>페이지를 열어두면 접수·조리·준비 상태가 갱신돼요. 준비되면 부스에서 주문번호를 보여주세요.</dd></div>
          </dl>
          <a className="landing-text-link" href="/demo">손님 화면에서 주문해 보기<ArrowRight size={20}/></a>
        </div>
      </div></section>
      <section className="landing-try" id="try" aria-labelledby="try-title"><div className="landing-wrap landing-try-inner">
        <div><h2 id="try-title">이제, 두 화면을<br/>직접 연결해 보세요.</h2><p>사장님 화면에서 손님 화면을 열어 주문해 보세요.<br/>하나의 주문이 접수부터 픽업까지 이어집니다.</p></div>
        <div className="landing-try-actions"><a className="landing-button" href="/studio">사장님으로 시작하기<ArrowRight size={22}/></a><a className="landing-button landing-button-outline" href="/demo">손님으로 주문해 보기<ArrowRight size={22}/></a><p>실제 결제 없는 체험 데모입니다.</p></div>
        <details className="landing-demo-details"><summary>데모에서 확인할 수 있는 범위</summary><p>메뉴 공개, QR 안내판, 한·영 주문, 조리·픽업 상태를 체험할 수 있습니다. 결제는 모의 결제이며 실제 카드 정보를 받지 않습니다. 사진으로 메뉴를 읽는 AI 기능은 API 연결 후 사용할 수 있습니다. 상태 갱신은 페이지가 열려 있을 때 동작합니다. 예시 메뉴·부스는 시연용입니다.</p></details>
      </div></section>
    </main>
    <div className="landing-footer landing-wrap"><div className="landing-footer-top"><PrintBrand/><p>작은 부스에서 시작되는, 더 넓은 축제.</p><a className="landing-back-top" href="#top">맨 위로<ArrowUp size={17}/></a></div><Credits lang="ko"/></div>
  </div>;
}
