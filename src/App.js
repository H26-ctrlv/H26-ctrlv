// App.js — Daily Voca v28.1.3 Realtime Firebase Sync
import React, { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import "./styles.css";
import { get, search } from "node-emoji";

/** 공통 접힘 컴포넌트 (Theme와 동일한 스타일 사용) */
function Fold({ title, defaultOpen = false, children, className = "" }) {
  return (
    <details className={`fold ${className}`} open={defaultOpen}>
      <summary>{title}</summary>
      <div className="fold-body">{children}</div>
    </details>
  );
}

/**
 * 변경 요약 (v1.6)
 * - [UI] "도구 / 음성·입력 설정 / Cloud" 를 테마처럼 접히는 패널로 변경
 * - [UI] 단어 카드 편집 시 "저장/취소" 버튼 가독성 강화 (라이트 카드에서도 선명)
 * - [UI] 헤더 액션 버튼과 통계 카드 사이 간격 추가(겹침 방지)
 * - [재생] 일괄재생/행별 ▶ 버튼 누를 때마다 이전 TTS를 완전히 정지하고 새 재생만
 * - [CSS] "open sandbox" 흰색 테두리 제거(검정 테두리 강제) + 포커스 아웃라인 조정
 * - [배치] [내 단어] → [선택 항목 작업] → [Add words/관리] 순서로 재배치
 */
// ---- Emoji auto-pick (node-emoji) ----
const KO2EN = [
  ["사랑", "heart"],
  ["애정", "heart"],
  ["좋아", "heart"],
  ["연인", "heart"],
  ["기쁨", "smile"],
  ["행복", "smile"],
  ["즐거", "smile"],
  ["웃음", "smile"],
  ["슬픔", "cry"],
  ["우울", "cry"],
  ["눈물", "cry"],
  ["상실", "cry"],
  ["화", "angry"],
  ["분노", "angry"],
  ["짜증", "angry"],
  ["격분", "angry"],
  ["두려", "fear"],
  ["공포", "fear"],
  ["무서", "fear"],
  ["불안", "fear"],
  ["걱정", "worried"],
  ["근심", "worried"],
  ["긴장", "worried"],
  ["놀람", "surprised"],
  ["충격", "surprised"],
  ["당황", "surprised"],
  ["괴롭", "confounded"],
  ["고통", "confounded"],
  ["아픔", "confounded"],
  ["외로", "lonely"],
  ["고독", "lonely"],
  ["그리", "heart"],
  ["보고싶", "heart"],
  ["후회", "thinking"],
  ["망설", "thinking"],
  ["고민", "thinking"],
  ["집중", "thinking"],
  ["생각", "thinking"],
  ["혼란", "confused"],
  ["헷갈", "confused"],
  ["평온", "relaxed"],
  ["안정", "relaxed"],
  ["차분", "relaxed"],
  ["만족", "relieved"],
  ["안도", "relieved"],
  ["희망", "sparkles"],
  ["기대", "sparkles"],
  ["절망", "broken_heart"],
  ["좌절", "broken_heart"],
  ["의욕", "muscle"],
  ["열정", "fire"],
  ["스트레스", "exploding_head"],
  ["압박", "exploding_head"],
  ["피로", "sleep"],
  ["지침", "sleep"],
  ["용기", "muscle"],
  ["자신감", "muscle"],
  ["의심", "question"],
  ["불신", "question"],
  ["믿음", "pray"],
  ["신뢰", "pray"],
  ["부끄", "flushed"],
  ["수치", "flushed"],
  ["질투", "green_heart"],
  ["시기", "green_heart"],
  ["분노", "rage"],
  ["원망", "rage"],

  ["몸", "body"],
  ["신체", "body"],
  ["머리", "head"],
  ["뇌", "brain"],
  ["눈", "eyes"],
  ["귀", "ear"],
  ["입", "mouth"],
  ["코", "nose"],
  ["손", "hand"],
  ["팔", "arm"],
  ["다리", "leg"],
  ["발", "foot"],
  ["심장", "heart"],
  ["폐", "lungs"],
  ["위", "stomach"],
  ["장", "intestines"],
  ["피", "blood"],
  ["뼈", "bone"],
  ["근육", "muscle"],
  ["병", "sick"],
  ["질병", "sick"],
  ["환자", "sick"],
  ["암", "dna"],
  ["종양", "dna"],
  ["대장암", "dna"],
  ["감기", "thermometer"],
  ["열", "thermometer"],
  ["발열", "thermometer"],
  ["통증", "confounded"],
  ["두통", "confounded"],
  ["상처", "bandage"],
  ["부상", "bandage"],
  ["수술", "hospital"],
  ["치료", "hospital"],
  ["약", "pill"],
  ["약물", "pill"],
  ["진통", "pill"],
  ["주사", "syringe"],
  ["백신", "syringe"],
  ["병원", "hospital"],
  ["응급", "ambulance"],
  ["회복", "muscle"],
  ["재활", "muscle"],
  ["사망", "skull"],
  ["죽음", "skull"],
  ["사고", "skull"],
  ["건강", "muscle"],
  ["운동", "muscle"],
  ["피로", "sleep"],
  ["불면", "sleep"],
  ["정신", "brain"],
  ["우울증", "brain"],
  ["중독", "warning"],
  ["알코올", "warning"],
  ["흡연", "smoking"],
  ["담배", "smoking"],
  ["비만", "warning"],
  ["체중", "weight"],
  ["임신", "pregnant"],
  ["출산", "baby"],
  ["노화", "older"],
  ["노인", "older"],

  ["사람", "person"],
  ["인간", "person"],
  ["남자", "man"],
  ["여자", "woman"],
  ["아이", "child"],
  ["아기", "baby"],
  ["노인", "older"],
  ["가족", "family"],
  ["부모", "family"],
  ["형제", "family"],
  ["친구", "friends"],
  ["동료", "office"],
  ["이웃", "house"],
  ["연인", "couple"],
  ["부부", "couple"],
  ["상사", "boss"],
  ["부하", "office"],
  ["학생", "student"],
  ["선생", "teacher"],
  ["의사", "doctor"],
  ["간호", "nurse"],
  ["경찰", "police"],
  ["군인", "soldier"],
  ["범죄자", "police"],
  ["사기", "fraud"],
  ["사기꾼", "fraud"],
  ["도둑", "thief"],
  ["강도", "thief"],
  ["영웅", "hero"],
  ["악당", "villain"],
  ["리더", "crown"],
  ["지도", "crown"],
  ["성격", "mask"],
  ["인격", "mask"],
  ["친절", "hug"],
  ["배려", "hug"],
  ["냉정", "snowflake"],
  ["차가", "snowflake"],
  ["거짓", "lying_face"],
  ["정직", "white_check_mark"],
  ["폭력", "crossed_swords"],
  ["위협", "warning"],
  ["존중", "pray"],
  ["모욕", "anger"],
  ["권위", "crown"],
  ["복종", "kneel"],

  ["물", "droplet"],
  ["병", "bottle"],
  ["용기", "bottle"],
  ["컵", "cup"],
  ["책", "book"],
  ["노트", "notebook"],
  ["펜", "pencil"],
  ["가방", "bag"],
  ["지갑", "wallet"],
  ["열쇠", "key"],
  ["문", "door"],
  ["창", "window"],
  ["의자", "chair"],
  ["책상", "desk"],
  ["침대", "bed"],
  ["전화", "phone"],
  ["휴대", "phone"],
  ["스마트", "phone"],
  ["컴퓨터", "computer"],
  ["노트북", "computer"],
  ["마우스", "mouse"],
  ["키보드", "keyboard"],
  ["시계", "clock"],
  ["알람", "alarm_clock"],
  ["불", "fire"],
  ["빛", "bulb"],
  ["전기", "battery"],
  ["충전", "battery"],
  ["차", "car"],
  ["자동차", "car"],
  ["버스", "bus"],
  ["자전거", "bike"],
  ["기차", "train"],
  ["비행", "airplane"],
  ["집", "house"],
  ["건물", "house"],
  ["상자", "package"],
  ["포장", "package"],
  ["선물", "gift"],
  ["택배", "package"],
  ["옷", "shirt"],
  ["신발", "shoe"],
  ["모자", "hat"],
  ["가구", "chair"],
  ["주방", "kitchen"],
  ["칼", "knife"],
  ["접시", "plate"],
  ["숟가락", "spoon"],
  ["냉장", "fridge"],
  ["세탁", "washing_machine"],
  ["청소", "broom"],
  ["쓰레기", "wastebasket"],
  ["가스", "fire"],
  ["연기", "smoke"],
  ["우산", "umbrella"],
  ["비옷", "umbrella"],
  ["안경", "glasses"],
  ["렌즈", "glasses"],
  ["카메라", "camera"],
  ["사진", "camera"],
  ["문서", "page"],
  ["파일", "file_folder"],
  ["지도", "map"],
  ["주소", "map"],
  ["가방", "backpack"],
  ["배낭", "backpack"],
  ["배터리", "battery"],
  ["케이블", "electric_plug"],
  ["리모컨", "tv"],
  ["텔레비전", "tv"],
  ["게임", "game"],
  ["컨트롤", "joystick"],
  ["악기", "musical_note"],
  ["피아노", "musical_note"],

  ["보다", "eyes"],
  ["보", "eyes"],
  ["관찰", "eyes"],
  ["듣", "ear"],
  ["청취", "ear"],
  ["말", "speech"],
  ["이야기", "speech"],
  ["읽", "book"],
  ["쓰", "pencil"],
  ["가", "walk"],
  ["오", "arrow_right"],
  ["걷", "walk"],
  ["달리", "runner"],
  ["앉", "chair"],
  ["서", "standing"],
  ["먹", "food"],
  ["마시", "drink"],
  ["자", "sleep"],
  ["깨", "alarm_clock"],
  ["일", "office"],
  ["업무", "office"],
  ["공부", "book"],
  ["학습", "book"],
  ["생각", "thinking"],
  ["판단", "thinking"],
  ["기다", "hourglass"],
  ["대기", "hourglass"],
  ["찾", "magnifying_glass"],
  ["검색", "magnifying_glass"],
  ["만나", "handshake"],
  ["악수", "handshake"],
  ["도와", "help"],
  ["지원", "help"],
  ["싸우", "crossed_swords"],
  ["다툼", "crossed_swords"],
  ["이기", "trophy"],
  ["승리", "trophy"],
  ["지", "flag"],
  ["패배", "flag"],
  ["시작", "rocket"],
  ["개시", "rocket"],
  ["끝", "checkered_flag"],
  ["종료", "checkered_flag"],
  ["멈추", "stop"],
  ["중단", "stop"],
  ["선택", "check_mark"],
  ["결정", "check_mark"],
  ["변경", "repeat"],
  ["반복", "repeat"],
  ["포기", "white_flag"],
  ["도전", "mountain"],
  ["약속", "handshake"],
  ["위반", "warning"],
  ["보호", "shield"],
  ["방어", "shield"],

  ["집", "house"],
  ["학교", "school"],
  ["회사", "office"],
  ["병원", "hospital"],
  ["가게", "store"],
  ["시장", "store"],
  ["공원", "park"],
  ["길", "road"],
  ["도로", "road"],
  ["도시", "city"],
  ["마을", "house"],
  ["나라", "flag"],
  ["국가", "flag"],
  ["바다", "ocean"],
  ["강", "river"],
  ["산", "mountain"],
  ["숲", "forest"],
  ["하늘", "sky"],
  ["비", "rain"],
  ["눈", "snow"],
  ["날씨", "sun"],
  ["위험", "warning"],
  ["안전", "shield"],
  ["전쟁", "crossed_swords"],
  ["평화", "dove"],
  ["돈", "money"],
  ["경제", "chart"],
  ["가격", "money"],
  ["비용", "money"],
  ["시간", "clock"],
  ["기회", "clock"],
  ["법", "scales"],
  ["규칙", "scales"],
  ["권리", "scroll"],
  ["의무", "scroll"],
  ["진실", "white_check_mark"],
  ["거짓", "lying_face"],
  ["문제", "question"],
  ["해결", "check_mark"],
  ["목표", "target"],
  ["계획", "clipboard"],
  ["성공", "trophy"],
  ["실패", "broken_heart"],

  // ===== KO2EN Adjectives Booster =====

  // 좋다/나쁘다
  ["좋은", "good"],
  ["좋다", "good"],
  ["좋", "good"],
  ["나쁜", "bad"],
  ["나쁘다", "bad"],
  ["나쁘", "bad"],

  // 크다/작다
  ["큰", "big"],
  ["크다", "big"],
  ["크", "big"],
  ["작은", "small"],
  ["작다", "small"],
  ["작", "small"],

  // 새롭다/오래되다/젊다/늙다
  ["새로운", "new"],
  ["새롭다", "new"],
  ["새롭", "new"],
  ["오래된", "old"],
  ["오래되다", "old"],
  ["오래", "old"],
  ["옛날의", "old"],
  ["젊은", "young"],
  ["젊다", "young"],
  ["젊", "young"],
  ["늙은", "old man"],
  ["늙다", "old"],
  ["늙", "old"],

  // ===== Colors =====
  ["파란", "blue"],
  ["파랑", "blue"],
  ["파랗", "blue"],
  ["푸른", "blue"],
  ["빨간", "red"],
  ["빨강", "red"],
  ["빨갛", "red"],
  ["검은", "black"],
  ["검정", "black"],
  ["까만", "black"],
  ["검", "black"],
  ["흰", "white"],
  ["하얀", "white"],
  ["희", "white"],
  ["흰색", "white"],
  ["초록", "green"],
  ["녹색", "green"],
  ["초록색", "green"],
  ["노란", "yellow"],
  ["노랑", "yellow"],
  ["노랗", "yellow"],
  ["회색", "gray"],
  ["그레이", "gray"],
  ["갈색", "brown"],
  ["밝은", "bright"],
  ["밝다", "bright"],
  ["밝", "bright"],
  ["어두운", "dark"],
  ["어둡다", "dark"],
  ["어둡", "dark"],
  ["금색", "gold"],
  ["금빛", "gold"],
  ["은색", "silver"],
  ["은빛", "silver"],

  // ===== Personality / attitude =====
  ["착한", "angel"],
  ["착하다", "angel"],
  ["착", "angel"],
  ["친절한", "kind"],
  ["친절", "kind"],
  ["친절하다", "kind"],
  ["엄격한", "strict"],
  ["엄격", "strict"],
  ["똑똑한", "smart"],
  ["똑똑", "smart"],
  ["영리한", "smart"],
  ["영리", "smart"],
  ["어리석은", "silly"],
  ["어리석", "silly"],
  ["바보", "silly"],
  ["바보 같은", "silly"],
  ["용감한", "brave"],
  ["용감", "brave"],
  ["정직한", "honest"],
  ["정직", "honest"],
  ["게으른", "lazy"],
  ["게으르", "lazy"],
  ["부지런한", "hardworking"],
  ["부지런", "hardworking"],

  // ===== Noise / calm =====
  ["조용한", "quiet"],
  ["조용", "quiet"],
  ["시끄러운", "loud"],
  ["시끄럽", "loud"],

  // ===== 재미/지루 =====
  ["재미있는", "fun"],
  ["재미", "fun"],
  ["지루한", "boring"],
  ["지루", "boring"],

  // ===== Price =====
  ["비싼", "expensive"],
  ["비싸", "expensive"],
  ["싼", "cheap"],
  ["싸다", "cheap"],
  ["싸", "cheap"],

  // ===== Speed / time =====
  ["빠른", "fast"],
  ["빠르", "fast"],
  ["느린", "slow"],
  ["느리", "slow"],
  ["늦은", "late"],
  ["늦다", "late"],
  ["늦", "late"],

  // ===== Difficulty =====
  ["쉬운", "easy"],
  ["쉽", "easy"],
  ["어려운", "hard"],
  ["어렵", "hard"],

  // ===== Distance =====
  ["가까운", "near"],
  ["가깝", "near"],
  ["먼", "far"],
  ["멀", "far"],

  // ===== Health =====
  ["건강한", "healthy"],
  ["건강", "healthy"],
  ["아픈", "sick"],
  ["아프", "sick"],

  // ===== Taste =====
  ["맛있는", "delicious"],
  ["맛있", "delicious"],
  ["맛없는", "disgusting"],
  ["맛없", "disgusting"],
  ["달콤한", "sweet"],
  ["달콤", "sweet"],
  ["짠", "salty"],
  ["짜", "salty"],
  ["신", "sour"],
  ["시다", "sour"],
  ["새콤", "sour"],
  ["쓴", "bitter"],
  ["쓰", "bitter"],

  // ===== Temperature / weather =====
  ["따뜻한", "warm"],
  ["따뜻", "warm"],
  ["차가운", "cold"],
  ["차갑", "cold"],
  ["추운", "cold"],
  ["춥", "cold"],
  ["더운", "hot"],
  ["덥", "hot"],
  ["시원한", "cool"],
  ["시원", "cool"],
  ["맑은", "sun"],
  ["맑", "sunny"],
  ["흐린", "cloud"],
  ["흐리", "cloudy"],

  // ===== Food texture =====
  ["기름진", "oil"],
  ["기름지", "oil"],
  ["담백한", "rice"],
  ["담백", "simple"],

  // ===== Emotions =====
  ["행복한", "happy"],
  ["행복", "happy"],
  ["슬픈", "sad"],
  ["슬프", "sad"],
  ["무서운", "scared"],
  ["무섭", "scared"],
  ["피곤한", "tired"],
  ["피곤", "tired"],
  ["졸린", "sleepy"],
  ["졸리", "sleepy"],
  ["화난", "angry"],
  ["화나", "angry"],
  ["기쁜", "happy"],
  ["기쁘", "happy"],
  ["외로운", "lonely"],
  ["외롭", "lonely"],

  // ===== Busy / leisure =====
  ["바쁜", "busy"],
  ["바쁘", "busy"],
  ["한가한", "relaxed"],
  ["한가", "relax"],

  // ===== Fame / normal / strange =====
  ["유명한", "star"],
  ["유명", "star"],
  ["평범한", "normal"],
  ["평범", "normal"],
  ["이상한", "weird"],
  ["이상", "weird"],

  // ===== Importance / necessity =====
  ["중요한", "important"],
  ["중요", "important"],
  ["필요없는", "no"],
  ["필요 없", "no"],
  ["불필요", "no"],
  ["편리한", "convenient"],
  ["편리", "convenient"],
  ["불편한", "uncomfortable"],
  ["불편", "uncomfortable"],

  // ===== Clean =====
  ["깨끗한", "clean"],
  ["깨끗", "clean"],
  ["더러운", "dirty"],
  ["더럽", "dirty"],

  // ===== Size / shape =====
  ["넓은", "wide"],
  ["넓", "wide"],
  ["좁은", "narrow"],
  ["좁", "narrow"],
  ["높은", "high"],
  ["높", "high"],
  ["낮은", "low"],
  ["낮", "low"],
  ["긴", "long"],
  ["길다", "long"],
  ["길", "long"],
  ["짧은", "short"],
  ["짧", "short"],
  ["무거운", "heavy"],
  ["무겁", "heavy"],
  ["가벼운", "light"],
  ["가볍", "light"],

  // ===== Safety =====
  ["안전한", "safe"],
  ["안전", "safe"],
  ["위험한", "danger"],
  ["위험", "danger"],

  // ===== Modern / traditional =====
  ["현대적인", "modern"],
  ["현대", "modern"],
  ["전통적인", "traditional"],
  ["전통", "traditional"],

  // ===== Convenience-ish extras =====
  ["자유로운", "free"],
  ["자유", "free"],
  ["부유한", "money"],
  ["부유", "rich"],
  ["가난한", "poor"],
  ["가난", "poor"],

  // ===== KO2EN Adjective Booster (for includes-matching) =====

  // 좋/나쁘
  ["좋은", "good"],
  ["좋다", "good"],
  ["좋", "good"],
  ["나쁜", "bad"],
  ["나쁘다", "bad"],
  ["나쁘", "bad"],

  // 크/작
  ["큰", "big"],
  ["크다", "big"],
  ["크", "big"],
  ["작은", "small"],
  ["작다", "small"],
  ["작", "small"],

  // 새롭/오래되/젊/늙
  ["새로운", "new"],
  ["새롭다", "new"],
  ["새롭", "new"],
  ["오래된", "old"],
  ["오래되다", "old"],
  ["오래되", "old"],
  ["옛날의", "old"],
  ["젊은", "young"],
  ["젊다", "young"],
  ["젊", "young"],
  ["늙은", "old"],
  ["늙다", "old"],
  ["늙", "old"],

  // ===== Colors (형태 변형 핵심) =====
  ["파란", "blue"],
  ["파랑", "blue"],
  ["파랗", "blue"],
  ["푸른", "blue"],
  ["빨간", "red"],
  ["빨강", "red"],
  ["빨갛", "red"],
  ["검은", "black"],
  ["검정", "black"],
  ["까만", "black"],
  ["검다", "black"],
  ["검", "black"],
  ["흰", "white"],
  ["하얀", "white"],
  ["흰색", "white"],
  ["희다", "white"],
  ["희", "white"],
  ["초록", "green"],
  ["초록색", "green"],
  ["녹색", "green"],
  ["노란", "yellow"],
  ["노랑", "yellow"],
  ["노랗", "yellow"],
  ["회색", "gray"],
  ["그레이", "gray"],
  ["갈색", "brown"],
  ["금색", "gold"],
  ["금빛", "gold"],
  ["은색", "silver"],
  ["은빛", "silver"],

  // 밝/어둡
  ["밝은", "bright"],
  ["밝다", "bright"],
  ["밝", "bright"],
  ["어두운", "dark"],
  ["어둡다", "dark"],
  ["어둡", "dark"],

  // 착/친절/엄격
  ["착한", "angel"],
  ["착하다", "angel"],
  ["착", "angel"],
  ["친절한", "kind"],
  ["친절하다", "kind"],
  ["친절", "kind"],
  ["엄격한", "strict"],
  ["엄격", "strict"],

  // 재미/지루
  ["재미있는", "fun"],
  ["재미", "fun"],
  ["지루한", "boring"],
  ["지루", "boring"],

  // 똑똑/영리/어리석/바보
  ["똑똑한", "smart"],
  ["똑똑", "smart"],
  ["영리한", "smart"],
  ["영리", "smart"],
  ["어리석은", "silly"],
  ["어리석", "silly"],
  ["바보 같은", "silly"],
  ["바보", "silly"],

  // 용감
  ["용감한", "brave"],
  ["용감", "brave"],

  // 조용/시끄럽
  ["조용한", "quiet"],
  ["조용", "quiet"],
  ["시끄러운", "loud"],
  ["시끄럽", "loud"],

  // 비싸/싸
  ["비싼", "expensive"],
  ["비싸다", "expensive"],
  ["비싸", "expensive"],
  ["싼", "cheap"],
  ["싸다", "cheap"],
  ["싸", "cheap"],

  // 빠르/느리 + 늦
  ["빠른", "fast"],
  ["빠르다", "fast"],
  ["빠르", "fast"],
  ["느린", "slow"],
  ["느리다", "slow"],
  ["느리", "slow"],
  ["늦은", "late"],
  ["늦다", "late"],
  ["늦", "late"],

  // 쉽/어렵
  ["쉬운", "easy"],
  ["쉽다", "easy"],
  ["쉽", "easy"],
  ["어려운", "hard"],
  ["어렵다", "hard"],
  ["어렵", "hard"],

  // 가깝/멀
  ["가까운", "near"],
  ["가깝다", "near"],
  ["가깝", "near"],
  ["먼", "far"],
  ["멀다", "far"],
  ["멀", "far"],

  // 건강/아프
  ["건강한", "healthy"],
  ["건강", "healthy"],
  ["아픈", "sick"],
  ["아프다", "sick"],
  ["아프", "sick"],

  // 맛있/맛없 + 단맛/짠맛/신맛/쓴맛
  ["맛있는", "delicious"],
  ["맛있다", "delicious"],
  ["맛있", "delicious"],
  ["맛없는", "disgusting"],
  ["맛없다", "disgusting"],
  ["맛없", "disgusting"],
  ["달콤한", "sweet"],
  ["달콤", "sweet"],
  ["짠", "salty"],
  ["짜다", "salty"],
  ["짜", "salty"],
  ["신", "sour"],
  ["시다", "sour"],
  ["시", "sour"],
  ["새콤", "sour"],
  ["쓴", "bitter"],
  ["쓰다", "bitter"],
  ["쓰", "bitter"],

  // 따뜻/차갑/춥/덥/시원 (날씨 포함)
  ["따뜻한", "warm"],
  ["따뜻", "warm"],
  ["따뜻하다", "warm"],
  ["차가운", "cold"],
  ["차갑다", "cold"],
  ["차갑", "cold"],
  ["추운", "cold"],
  ["춥다", "cold"],
  ["춥", "cold"],
  ["더운", "hot"],
  ["덥다", "hot"],
  ["덥", "hot"],
  ["시원한", "cool"],
  ["시원", "cool"],

  // 기름지/담백
  ["기름진", "oil"],
  ["기름지", "oil"],
  ["기름", "oil"],
  ["담백한", "simple"],
  ["담백", "simple"],

  // 행복/슬프/무섭/피곤/졸리/화나/기쁘/외롭
  ["행복한", "happy"],
  ["행복", "happy"],
  ["슬픈", "sad"],
  ["슬프다", "sad"],
  ["슬프", "sad"],
  ["무서운", "scared"],
  ["무섭다", "scared"],
  ["무섭", "scared"],
  ["피곤한", "tired"],
  ["피곤", "tired"],
  ["졸린", "sleepy"],
  ["졸리다", "sleepy"],
  ["졸리", "sleepy"],
  ["화난", "angry"],
  ["화나다", "angry"],
  ["화나", "angry"],
  ["기쁜", "happy"],
  ["기쁘다", "happy"],
  ["기쁘", "happy"],
  ["외로운", "lonely"],
  ["외롭다", "lonely"],
  ["외롭", "lonely"],

  // 바쁘/한가
  ["바쁜", "busy"],
  ["바쁘다", "busy"],
  ["바쁘", "busy"],
  ["한가한", "relaxed"],
  ["한가", "relaxed"],

  // 유명/평범/이상
  ["유명한", "star"],
  ["유명", "star"],
  ["평범한", "normal"],
  ["평범", "normal"],
  ["이상한", "weird"],
  ["이상", "weird"],

  // 중요/불필요/편리/불편
  ["중요한", "important"],
  ["중요", "important"],
  ["필요없는", "no"],
  ["필요 없", "no"],
  ["불필요", "no"],
  ["편리한", "convenient"],
  ["편리", "convenient"],
  ["불편한", "uncomfortable"],
  ["불편", "uncomfortable"],

  // 깨끗/더럽
  ["깨끗한", "clean"],
  ["깨끗", "clean"],
  ["더러운", "dirty"],
  ["더럽다", "dirty"],
  ["더럽", "dirty"],

  // 넓/좁/높/낮
  ["넓은", "wide"],
  ["넓다", "wide"],
  ["넓", "wide"],
  ["좁은", "narrow"],
  ["좁다", "narrow"],
  ["좁", "narrow"],
  ["높은", "high"],
  ["높다", "high"],
  ["높", "high"],
  ["낮은", "low"],
  ["낮다", "low"],
  ["낮", "low"],

  // 길/짧 (불규칙 포함)
  ["긴", "long"],
  ["길다", "long"],
  ["길", "long"],
  ["짧은", "short"],
  ["짧다", "short"],
  ["짧", "short"],

  // 무겁/가볍
  ["무거운", "heavy"],
  ["무겁다", "heavy"],
  ["무겁", "heavy"],
  ["가벼운", "light"],
  ["가볍다", "light"],
  ["가볍", "light"],

  // 안전/위험
  ["안전한", "safe"],
  ["안전", "safe"],
  ["위험한", "danger"],
  ["위험", "danger"],

  // 맑/흐리 (날씨)
  ["맑은", "sunny"],
  ["맑다", "sunny"],
  ["맑", "sunny"],
  ["흐린", "cloudy"],
  ["흐리다", "cloudy"],
  ["흐리", "cloudy"],

  // 부유/가난/자유
  ["부유한", "rich"],
  ["부유", "rich"],
  ["가난한", "poor"],
  ["가난", "poor"],
  ["자유로운", "free"],
  ["자유", "free"],

  // 현대/전통
  ["현대적인", "modern"],
  ["현대", "modern"],
  ["전통적인", "traditional"],
  ["전통", "traditional"],
];

function normalizeKoForEmoji(ko = "") {
  let s = (ko || "").trim();

  // 쉼표/괄호 뒤 설명 제거(원하면)
  s = s.replace(/\([^)]*\)/g, " ");
  s = s.replace(/[,\u00B7·/]/g, " "); // 구분자 통일
  s = s.replace(/\s+/g, " ").trim();

  // ✅ 관형사형(형용사) 패턴을 기본형으로 근사 변환
  // 좋은→좋다, 나쁜→나쁘다, 큰→크다, 작은→작다 같은 불규칙 포함
  const special = {
    좋은: "좋다",
    나쁜: "나쁘다",
    큰: "크다",
    작은: "작다",
    긴: "길다",
    짧은: "짧다",
    많은: "많다",
    적은: "적다",
    빠른: "빠르다",
    느린: "느리다",
    파란: "파랗다",
    빨간: "빨갛다",
    검은: "검다",
    흰: "희다",
    초록: "초록", // 색상 단어는 그냥 유지
    푸른: "파랗다",
  };

  // 단어 단위로 치환(문장도 대비)
  const tokens = s.split(" ");
  const mapped = tokens.map((t) => special[t] || t);
  s = mapped.join(" ");

  // ✅ 일반적인 관형사형 ~은/는/ㄴ → 원형 힌트 붙이기 (너무 공격적이면 끄기)
  // 예: "새로운" → "새롭다", "오래된" → "오래되다"
  s = s
    .replace(/([가-힣]+)로운\b/g, "$1롭다") // 새로운/더러운류 근사
    .replace(/([가-힣]+)된\b/g, "$1되다") // 오래된→오래되다
    .replace(/([가-힣]+)은\b/g, "$1다") // (거친 근사) 많은→많다 등은 위 special이 우선
    .replace(/([가-힣]+)는\b/g, "$1다")
    .replace(/([가-힣]+)ㄴ\b/g, "$1다");

  return s.trim();
}

function normMeaning(s = "") {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,;:()[\]{}"'“”‘’!?]/g, "")
    .slice(0, 80);
}

function meaningToEnQueries(meaningKo = "") {
  const m = normMeaning(meaningKo);
  if (!m) return [];

  const hits = [];
  for (const [ko, en] of KO2EN) {
    if (m.includes(ko)) hits.push(en);
    if (hits.length >= 2) break;
  }
  return hits;
}

function pickFromSearchResults(results) {
  if (!Array.isArray(results) || results.length === 0) return "";
  return results[0]?.emoji || "";
}

// ---------------------------
// Translate RU -> KO (cached + concurrency-friendly)
// ---------------------------
const TRANS_CACHE_KEY = "rusdrops_translate_cache_v1";

// 1) localStorage cache
function loadTransCache() {
  try {
    return JSON.parse(localStorage.getItem(TRANS_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveTransCache(cache) {
  localStorage.setItem(TRANS_CACHE_KEY, JSON.stringify(cache));
}

// 2) Basic normalizer
function normKey(s = "") {
  return s.trim().replace(/\s+/g, " ");
}

// ✅ Provider: Google GTX (works well in browser because it's GET)
async function translateViaGoogleGtx(ruText) {
  const url =
    "https://translate.googleapis.com/translate_a/single" +
    `?client=gtx&sl=ru&tl=ko&dt=t&q=${encodeURIComponent(ruText)}`;

  const res = await fetch(url);

  // ✅ 레이트리밋이면 조금 쉬고 1회 재시도
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 800));
    const res2 = await fetch(url);
    if (!res2.ok) throw new Error(`Google gtx HTTP ${res2.status}`);
    const data2 = await res2.json();
    const chunks2 = Array.isArray(data2?.[0]) ? data2[0] : [];
    return chunks2
      .map((c) => c?.[0] || "")
      .join("")
      .trim();
  }

  if (!res.ok) throw new Error(`Google gtx HTTP ${res.status}`);

  const data = await res.json();
  const chunks = Array.isArray(data?.[0]) ? data[0] : [];
  return chunks
    .map((c) => c?.[0] || "")
    .join("")
    .trim();
}

// ⚠️ LibreTranslate는 지금 CORS(redirect-preflight) 때문에 브라우저에서 잘 깨짐.
// 필요하면 나중에 "프록시 서버"를 둔 뒤에 다시 켜는 게 좋음.
async function translateViaLibre(ruText) {
  const endpoint = "https://libretranslate.de/translate";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: ruText,
      source: "ru",
      target: "ko",
      format: "text",
    }),
  });

  const raw = await res.text();
  if (!res.ok) throw new Error(`LibreTranslate HTTP ${res.status}: ${raw}`);
  const data = JSON.parse(raw);
  return (data?.translatedText || "").trim();
}

// Main translate: cache -> gtx -> (optional) libre
async function translateRuToKoCached(ruText) {
  const ru = normKey(ruText);
  if (!ru) return "";

  const cache = loadTransCache();
  if (cache[ru]) return cache[ru];

  // 1) gtx 먼저
  try {
    const ko = await translateViaGoogleGtx(ru);
    if (ko) {
      cache[ru] = ko;
      saveTransCache(cache);
    }
    return ko || "";
  } catch (e1) {
    // 2) (선택) Libre fallback — 지금은 꺼두는 걸 추천
    //    켜고 싶으면 아래 try/catch 주석을 해제
    /*
    try {
      const ko2 = await translateViaLibre(ru);
      if (ko2) {
        cache[ru] = ko2;
        saveTransCache(cache);
      }
      return ko2 || "";
    } catch (e2) {
      console.warn("Translate failed:", ru, e1?.message || e1, e2?.message || e2);
      return "";
    }
    */
    console.warn("Translate failed:", ru, e1?.message || e1);
    return "";
  }
}

// 6) Concurrency-limited mapper (fast + safe)
async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let idx = 0;

  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= items.length) break;
      results[i] = await mapper(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.max(1, limit) }, worker);
  await Promise.all(workers);
  return results;
}

// ---- Emoji overrides (learn from your edits) ----
const EMOJI_OVERRIDES_KEY = "rusdrops_emoji_overrides_v1";

function loadEmojiOverrides() {
  try {
    return JSON.parse(localStorage.getItem(EMOJI_OVERRIDES_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveEmojiOverride(koMeaning, emojiChar) {
  const key = (koMeaning || "").trim();
  if (!key) return;

  const map = loadEmojiOverrides();

  // 이모지를 비우면(삭제) 오버라이드 제거
  const val = (emojiChar || "").trim();
  if (!val) {
    delete map[key];
  } else {
    map[key] = val;
  }

  localStorage.setItem(EMOJI_OVERRIDES_KEY, JSON.stringify(map));
}

function autoPickEmoji(meaningKo) {
  const meaning = normMeaning(normalizeKoForEmoji(meaningKo));
  if (!meaning) return "";

  const overrides = loadEmojiOverrides();
  if (overrides[meaning]) return overrides[meaning];

  const queries = meaningToEnQueries(meaning);

  for (const q of queries) {
    // get은 :key: 형태면 실패한 것
    const exact = get(q);
    if (exact && exact !== `:${q}:`) return exact;

    const found = pickFromSearchResults(search(q));
    if (found) return found;
  }

  return "📌";
}

// ---------------------------
// ✅ ZIP Import Merge Helpers (preserve progress, add only new words + mp3)
// ---------------------------
function normText(s) {
  return String(s ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function wordKey(w) {
  // 1) id가 있으면 최우선
  if (w?.id) return `id:${w.id}`;

  // 2) 너희 앱에서 흔한 키들(ru/ko) 최대한 커버
  const ru = normText(w?.ru ?? w?.rus ?? w?.word ?? w?.term ?? "");
  const ko = normText(w?.ko ?? w?.kor ?? w?.meaning ?? w?.def ?? "");
  return `rk:${ru}||${ko}`;
}

function extractMp3Patch(w) {
  const patch = {};

  // 1) URL/DataURL 방식 mp3
  if (w?.mp3Url) patch.mp3Url = w.mp3Url;
  if (w?.mp3DataUrl) patch.mp3DataUrl = w.mp3DataUrl;
  if (w?.mp3) patch.mp3 = w.mp3;

  // 2) ✅ IndexedDB 연결 키도 같이 보강 (ZIP 오디오 복원과 연결됨)
  if (w?.audioKey) patch.audioKey = w.audioKey;
  if (w?.audioMime) patch.audioMime = w.audioMime;

  return patch;
}

/**
 * ✅ 기존 암기 기록(색/SRS 등)은 유지
 * ✅ ZIP에서 들어온 새 단어는 추가
 * ✅ 기존 단어는 "mp3가 없을 때만" mp3를 보강
 */
function mergeWordsPreserveProgress(existingWords = [], incomingWords = []) {
  const existingMap = new Map();
  for (const w of existingWords) existingMap.set(wordKey(w), w);

  const merged = [...existingWords];
  const mergedKeys = new Set(existingWords.map(wordKey));

  for (const nw of incomingWords) {
    const k = wordKey(nw);

    // ✅ 완전 신규 단어면 추가
    if (!mergedKeys.has(k)) {
      merged.push(nw);
      mergedKeys.add(k);
      continue;
    }

    // ✅ 기존 단어면: 기록은 건드리지 않고 mp3만 보강
    const ow = existingMap.get(k);
    if (!ow) continue;

    const mp3Patch = extractMp3Patch(nw);

    // ✅ (A) mp3Url/mp3DataUrl/mp3 보강: 기존에 mp3가 없을 때만
    const hasOldMp3 = !!(ow?.mp3Url || ow?.mp3DataUrl || ow?.mp3);
    const hasNewMp3 = !!(
      mp3Patch.mp3Url ||
      mp3Patch.mp3DataUrl ||
      mp3Patch.mp3
    );

    if (!hasOldMp3 && hasNewMp3) {
      // mp3 관련만 안전하게 보강
      if (mp3Patch.mp3Url) ow.mp3Url = mp3Patch.mp3Url;
      if (mp3Patch.mp3DataUrl) ow.mp3DataUrl = mp3Patch.mp3DataUrl;
      if (mp3Patch.mp3) ow.mp3 = mp3Patch.mp3;
    }

    // ✅ (B) audioKey/audioMime 보강: 기존에 audioKey가 없을 때만
    if (!ow?.audioKey && mp3Patch.audioKey) {
      ow.audioKey = mp3Patch.audioKey;
      if (!ow?.audioMime && mp3Patch.audioMime)
        ow.audioMime = mp3Patch.audioMime;
    }
  }

  return merged;
}

const T = {
  panel: {
    border: "1px solid var(--line)",
    borderRadius: "var(--radius)",
    background: "var(--panel)",
  },
  panelStrong: {
    border: "1px solid var(--line-soft)",
    borderRadius: "var(--radius-lg)",
    background: "var(--panel-strong)",
    color: "var(--fg)",
  },
  subtle: { color: "var(--subtle)" },
  chip: {
    border: "1px solid var(--line)",
    background: "var(--panel)",
    borderRadius: 8,
    padding: "6px 12px",
  },
};

const now = () => Date.now();
const uid = () => "w_" + Math.random().toString(36).slice(2, 10);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ✅ 시드 기반 랜덤(새로고침/리렌더에도 섞인 순서가 튀지 않게)
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, seed) {
  const a = arr.slice();
  const rnd = mulberry32(seed || 1);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MODE_ORDER = ["learn", "type", "dict", "choice"];
const nextModeInCycle = (m) =>
  MODE_ORDER[(MODE_ORDER.indexOf(m) + 1) % MODE_ORDER.length];

const DEFAULT_FOLDER = "기본";
const MARKS = { green: "green", yellow: "yellow", red: "red" };

// ===== Traffic-light filter (per-folder) =====
const TL_SEQ = ["on", "off", "g", "y", "yr", "r"]; // 순환 순서

function nextTlMode(cur) {
  const i = TL_SEQ.indexOf(cur || "on");
  return TL_SEQ[(i + 1) % TL_SEQ.length];
}

// mode -> allowed marks set (null이면 "필터 없음" = 전체)
function tlModeToSet(mode) {
  switch (mode) {
    case "off":
      return "__UNLEARNED__";
    case "g":
      return new Set(["green"]);
    case "y":
      return new Set(["yellow"]);
    case "yr":
      return new Set(["yellow", "red"]);
    case "r":
      return new Set(["red"]);
    case "on":
      return null; // 다켜짐: 전체(체크안함 포함)
    case "all":
    default:
      return null; // 전체
  }
}

// 리스트 필터링: mode가 all이면 그대로, 아니면 mark가 해당 색상인 것만
function filterByTlMode(list, mode) {
  const rule = tlModeToSet(mode);
  if (!rule) return list;
  if (rule === "__UNLEARNED__") return (list || []).filter((w) => !w?.mark);
  return (list || []).filter((w) => rule.has(w?.mark));
}

// 신호등 UI 색상(켜짐/꺼짐)
function tlDotStyle(on, color) {
  const dim = {
    green: "#8FA9A0", // 회색빛 초록(꺼짐)
    yellow: "#A6A18A", // 꺼진 노랑
    red: "#B19A9A", // 꺼진 빨강
  };
  const lit = {
    green: "#37D67A",
    yellow: "#FFD24A",
    red: "#FF5B6B",
  };
  return {
    width: 18,
    height: 18,
    borderRadius: 999,
    display: "inline-block",
    background: on ? lit[color] : dim[color],
    boxShadow: on ? "0 0 0 2px rgba(255,255,255,.15)" : "none",
    transition: "transform .12s ease, background .15s ease",
    transform: on ? "scale(1.0)" : "scale(0.96)",
  };
}

// 라이트 배경(표시색)에서 가독성 보장
const MARK_STYLE = {
  green: { bg: "#D9F7E7", fg: "#0b2a1a" },
  yellow: { bg: "#FFF3A6", fg: "#3a2d00" },
  red: { bg: "#FFD4D8", fg: "#3a0a12" },
};
const markStyle = (m) => MARK_STYLE[m] || null;
const SUB_ON_LIGHT = "rgba(0,0,0,.62)";

function parseCSVorTSV(line) {
  if (line.includes("\t")) return line.split("\t").map((s) => s.trim());
  const out = [];
  let cur = "",
    inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim().replace(/^"|"$/g, ""));
}

// ---------------------------
// ✅ Bulk Text Parser (가져오기용)
// 지원 포맷(한 줄 = 한 항목)
// 1) TSV:  ru<TAB>ko<TAB>folder?
// 2) CSV:  ru,ko,ipa?,emoji?,folder?,ruAudio?
// 3) Pipe: ru|ko|folder
// - (권장) 5칸: ru, ko, ipa(빈칸 가능), emoji, folder
// - 4칸:  ru, ko, emoji, folder   또는 ru, ko, ipa, folder
// - 3칸:  ru, ko, folder
// ---------------------------
function parseBulkText(txt, forcedFolder) {
  const raw = String(txt || "").trim();
  if (!raw) return [];

  // CSV 한 줄 파서(따옴표 지원)
  const parseCsvLine = (line) => {
    const out = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = !inQ;
        }
        continue;
      }
      if (!inQ && ch === ",") {
        out.push(cur.trim());
        cur = "";
        continue;
      }
      cur += ch;
    }
    out.push(cur.trim());
    return out.map((s) => s.replace(/^"(.*)"$/s, "$1").trim());
  };

  const isEmojiLike = (s) => !!extractEmojis(s);

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  const res = [];

  for (const line of lines) {
    let cols;
    if (line.includes("\t")) cols = line.split("\t").map((s) => s.trim());
    else if (line.includes("|")) cols = line.split("|").map((s) => s.trim());
    else cols = parseCsvLine(line);

    const ru = String(cols?.[0] || "").trim();
    if (!ru) continue;

    const ko = String(cols?.[1] || "").trim();
    const c2 = String(cols?.[2] || "").trim();
    const c3 = String(cols?.[3] || "").trim();
    const c4 = String(cols?.[4] || "").trim();
    const c5 = String(cols?.[5] || "").trim();

    let ipa = "";
    let emoji = "";
    let folder = "";
    let ruAudio = "";

    if (cols.length >= 5) {
      // 5칸: ru, ko, ipa, emoji, folder (+ 6번째 ruAudio 가능)
      ipa = c2;
      emoji = c3;
      folder = c4;
      ruAudio = c5;
    } else if (cols.length === 4) {
      // 4칸: ru, ko, emoji, folder  OR ru, ko, ipa, folder
      if (isEmojiLike(c2)) {
        emoji = c2;
        folder = c3;
      } else {
        ipa = c2;
        folder = c3;
      }
    } else if (cols.length === 3) {
      folder = c2;
    }

    const folderFinal =
      String(forcedFolder || "").trim() ||
      String(folder || "").trim() ||
      DEFAULT_FOLDER;

    res.push({
      ru,
      ko,
      ipa,
      img: "",
      emoji,
      folder: folderFinal,
      ruAudio,
    });
  }

  return res;
}

// ✅ 거의 모든 이모지 잡기 (지원 안 되면 fallback)
function extractEmojis(s) {
  try {
    if (!s) return "";
    const str = String(s);

    // 1) 최신 브라우저: ✅ 국기(Regional Indicator 2글자) + 일반 이모지(Extended_Pictographic) 모두 추출
    try {
      const re =
        /(?:[\u{1F1E6}-\u{1F1FF}]{2}|\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/gu;
      const hits = str.match(re);
      return hits ? hits.join("") : "";
    } catch {
      // regex 미지원이면 아래 fallback
    }

    // 2) fallback: 대충이라도 넓게 커버 (여러 블록 + 변형 선택자)
    let out = "";
    for (const ch of Array.from(str)) {
      const cp = ch.codePointAt(0);

      const ok =
        (cp >= 0x1f000 && cp <= 0x1ffff) || // 대부분 이모지(국기 포함)
        (cp >= 0x2600 && cp <= 0x27bf) || // dingbats 포함
        (cp >= 0x2300 && cp <= 0x23ff) || // ⏳⏰⏱️ 등
        (cp >= 0x2b00 && cp <= 0x2bff) || // ⬆️⬇️ 등
        cp === 0xfe0f || // VS16
        cp === 0x200d; // ZWJ

      if (ok) out += ch;
    }
    return out;
  } catch {
    return "";
  }
}

// 기존 함수 이름을 유지하고 싶으면 래핑해서 사용 가능
function extractFirstEmoji(s) {
  const all = extractEmojis(s);
  return all ? Array.from(all)[0] : "";
}

const STORAGE = {
  words: "rusdrops_words_v1",
  settings: "rusdrops_settings_v1",
  fbConfig: "rusdrops_firebase_config_v1",
  cloud: "rusdrops_cloud_state_v1",
  theme: "rusdrops_theme_v1",
};

const DEFAULT_FB_CONFIG = {
  apiKey: "AIzaSyCx4MFDt63dp0DHoOjrvgs4h7D3S_g3KUo",
  authDomain: "russiansync-8113d.firebaseapp.com",
  projectId: "russiansync-8113d",
  storageBucket: "russiansync-8113d.firebasestorage.app",
  messagingSenderId: "433111309379",
  appId: "1:433111309379:web:d8473ce5eeea06de3008f6",
};

const DEFAULT_THEME = {
  bg: "#0b2f49",
  bg2: "#0a2740",
  text: "#eaf2f7",
  sub: "#b9c7d3",
  surfaceAlpha: 0.06,
  surfaceStrongAlpha: 0.1,
  borderAlpha: 0.18,
  borderSoftAlpha: 0.12,
  radius: 14,
  radiusLg: 18,
};
function applyTheme(t) {
  const r = document.documentElement;
  r.style.setProperty("--bg1", t.bg);
  r.style.setProperty("--bg2", t.bg2);
  r.style.setProperty("--fg", t.text);
  r.style.setProperty("--subtle", t.sub);
  r.style.setProperty("--panel", `rgba(255,255,255,${t.surfaceAlpha})`);
  r.style.setProperty(
    "--panel-strong",
    `rgba(255,255,255,${t.surfaceStrongAlpha})`
  );
  r.style.setProperty("--line", `rgba(255,255,255,${t.borderAlpha})`);
  r.style.setProperty("--line-soft", `rgba(255,255,255,${t.borderSoftAlpha})`);
  r.style.setProperty("--radius", `${t.radius}px`);
  r.style.setProperty("--radius-lg", `${t.radiusLg}px`);
  // legacy fallback
  r.style.setProperty("--c-bg", t.bg);
  r.style.setProperty("--c-bg2", t.bg2);
  r.style.setProperty("--c-text", t.text);
  r.style.setProperty("--c-sub", t.sub);
  r.style.setProperty("--c-surface", `rgba(255,255,255,${t.surfaceAlpha})`);
  r.style.setProperty(
    "--c-surface-strong",
    `rgba(255,255,255,${t.surfaceStrongAlpha})`
  );
  r.style.setProperty("--c-border", `rgba(255,255,255,${t.borderAlpha})`);
  r.style.setProperty(
    "--c-border-soft",
    `rgba(255,255,255,${t.borderSoftAlpha})`
  );
}

const DEFAULT_SETTINGS = {
  srsDirection: "RU_KO", // RU_KO | KO_RU

  sessionMinutes: 5,
  dailyNewLimit: 20,
  mode: "learn",
  shuffleChoices: true,
  repeatRU: 3,
  repeatKO: 1,
  gapMs: 1000,
  ruVoiceName: "",
  koVoiceName: "",
  ttsVolume: 1,
  ttsRate: 1,
  ttsPitch: 1,
  cancelBeforeSpeak: true,
  redFirst: true,
  loopRounds: 1,
  rampMode: "none",
  translit: true,
  folderSort: "name",
  folderOrder: {},
  collapsedFolders: {},
  folderPlayPrefs: {}, // ✅ 폴더별 일괄재생 방식 기억
  // ✅ 폴더별 보기 모드(기본/가독성) 저장
  folderViewPrefs: {},
  sessionFolder: "모두",
  sessionOrder: "srs",
  sessionCount: 30,
  sessionAutoRepeat: false,
  sessionAutoCycleMode: false,
};

const load = (k, fb) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v ?? fb;
  } catch {
    return fb;
  }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function normName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function scoreRuVoice(v) {
  const name = normName(v?.name);
  const lang = String(v?.lang || "").toLowerCase();

  let score = 0;

  // 1) 언어 정확도
  if (lang === "ru-ru") score += 80;
  else if (lang.startsWith("ru")) score += 60;

  // 2) iOS/Apple 계열에서 자연스러운 쪽 가산
  // (환경마다 표기가 달라서 "siri", "milena", "yuri" 같은 키워드 기반)
  if (name.includes("milena")) score += 40;
  if (name.includes("yuri")) score += 40;
  if (name.includes("siri")) score += 25;

  // 3) 기계적인 음성/낡은 음성 감점(흔히 compact가 더 로봇틱)
  if (name.includes("compact")) score -= 35;

  // 4) 너무 짧은/이상한 랭크 방지 (가끔 "ru"만 달랑 있는 애들)
  if (!lang.includes("ru")) score -= 100;

  return score;
}

function pickBestRuVoice(preferredName) {
  const synth = window.speechSynthesis;
  if (!synth) return null;

  const voices = synth.getVoices() || [];
  if (!voices.length) return null;

  // 1) 사용자가 이름 지정했으면 그걸 최우선
  if (preferredName) {
    const wanted = normName(preferredName);
    const exact = voices.find((v) => normName(v.name) === wanted);
    if (exact) return exact;

    // 이름이 살짝 다를 수도 있으니 부분매칭도 한번
    const partial = voices.find((v) => normName(v.name).includes(wanted));
    if (partial) return partial;
  }

  // 2) 자동: 점수 높은 RU voice 선택
  const ruVoices = voices.filter((v) =>
    String(v.lang || "")
      .toLowerCase()
      .startsWith("ru")
  );
  if (!ruVoices.length) return null;

  ruVoices.sort((a, b) => scoreRuVoice(b) - scoreRuVoice(a));
  return ruVoices[0] || null;
}

// ====== TTS ======
function pickVoiceByName(name) {
  try {
    return (
      (window.speechSynthesis?.getVoices?.() || []).find(
        (v) => v.name === name
      ) || null
    );
  } catch {
    return null;
  }
}
function pickVoiceByLang(regex) {
  try {
    const vs = window.speechSynthesis?.getVoices?.() || [];
    return (
      vs.find((v) => regex.test(v.lang)) ||
      vs.find((v) => regex.test(v.name)) ||
      null
    );
  } catch {
    return null;
  }
}
function speak(text, langTag, opts = {}) {
  return new Promise((resolve) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return resolve();

      const u = new SpeechSynthesisUtterance(text || " ");

      // voice 선택
      let voice = null;

      // ✅ RU는 "자동 최적 보이스" 우선
      const isRu = String(langTag || "")
        .toLowerCase()
        .startsWith("ru");

      if (isRu) {
        voice = pickBestRuVoice(opts.voiceName); // voiceName 지정했으면 그거 우선, 아니면 자동
      } else {
        if (opts.voiceName) voice = pickVoiceByName(opts.voiceName);
        if (!voice) {
          const base = (langTag || "").split("-")[0];
          voice = pickVoiceByLang(new RegExp(`^${base}\\b`, "i"));
        }
      }
      if (voice) u.voice = voice;

      u.lang = voice?.lang || langTag;
      u.volume = typeof opts.volume === "number" ? opts.volume : 1;
      u.rate = typeof opts.rate === "number" ? opts.rate : 1;
      u.pitch = typeof opts.pitch === "number" ? opts.pitch : 1;

      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;

        // ✅ watchdog 정리
        if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }

        try {
          u.onend = null;
          u.onerror = null;
        } catch {}
        resolve();
      };

      u.onend = finish;
      u.onerror = finish;

      // ✅ 여기서 cancel은 “카드 전환 시 cleanup”에서만 하는 게 안정적
      if (opts.cancelBeforeSpeak) {
        try {
          // speaking/pending일 때만 정리 (무조건 cancel 반복 호출 금지)
          if (synth.speaking || synth.pending) synth.cancel();
        } catch {}
      }

      // ✅ cancel 이후 묵음/정지 상태 방지
      try {
        synth.resume?.();
      } catch {}

      synth.speak(u);

      // ✅ 안전장치(이벤트가 아예 안 오는 환경 대비) - 절대 "짧게" 잡지 말 것
      const watchdogMs = Math.min(
        45000,
        Math.max(8000, (String(text || "").length || 1) * 350)
      );
      // ✅ timerId에 저장
      timerId = setTimeout(finish, watchdogMs);
    } catch {
      resolve();
    }
  });
}

// ✅ RU TTS에 들어가기 전에 텍스트 정리 (강세표시/이상문자 제거용)
function normalizeRuTtsText(text) {
  let t = String(text || "")
    .normalize("NFC")
    // 결합 악센트(강세 표시) 제거: á 같은 거(Windows/iOS TTS가 이상하게 읽는 경우 방지)
    .replace(/\u0301/g, "")
    // 제로폭 문자 제거(발음/멈칫 이슈 방지)
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  if (!t) return t;

  // ✅ (1) 특정 종결(특히 l/? !)에서 iOS RU TTS 떨림/울림 완화: 억양을 눌러줌
  // - "сде́лал?" 같이 끝이 "л?"로 끝나는 경우 체감 개선이 큰 편
  t = t.replace(/л\?$/u, "л?…");
  t = t.replace(/л!$/u, "л!…");

  // ✅ (2) 일부 자음군 "дл"에서 울림이 도드라지면 TTS용으로만 아주 미세 분리
  // 필요 없거나 어색하면 이 줄을 주석 처리해도 OK
  t = t.replace(/дл([а-яё])/giu, "д л$1");

  // ✅ (3) 끝이 문장부호로 끝나지 않으면 마침표 추가 (억양 안정화)
  if (!/[.!?…;:)"»\]]$/.test(t)) t += ".";

  return t;
}

function ensureVoicesLoaded({ timeoutMs = 3500 } = {}) {
  const synth = window.speechSynthesis;
  if (!synth || !synth.getVoices) return Promise.resolve([]);

  // 1) 이미 있으면 즉시 반환
  try {
    const v0 = synth.getVoices();
    if (v0 && v0.length) return Promise.resolve(v0);
  } catch {}

  // 2) voiceschanged 기다리되, iOS에서 이벤트가 늦거나 안 오는 케이스 대비 폴링
  return new Promise((resolve) => {
    const start = Date.now();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      try {
        synth.removeEventListener?.("voiceschanged", onChanged);
      } catch {}
      try {
        resolve(synth.getVoices() || []);
      } catch {
        resolve([]);
      }
    };

    const onChanged = () => {
      try {
        const v = synth.getVoices();
        if (v && v.length) return finish();
      } catch {}
      // 이벤트 왔는데도 비면 폴링이 마저 처리
    };

    try {
      synth.addEventListener?.("voiceschanged", onChanged);
    } catch {}

    const tick = () => {
      if (done) return;
      try {
        const v = synth.getVoices();
        if (v && v.length) return finish();
      } catch {}

      if (Date.now() - start >= timeoutMs) return finish();
      setTimeout(tick, 100);
    };

    tick();
  });
}

function needsAntiWobbleRu(t) {
  const s = String(t || "").toLowerCase();

  // r/l 포함 + 자음군에서 더 티남
  return (
    /[рл]/.test(s) &&
    /[бвгджзйклмнпрстфхцчшщ][рл]|[рл][бвгджзйклмнпрстфхцчшщ]/.test(s)
  );
}

// ✅ RU만 특별 취급: voice가 안 잡히면 "мягкий знак" 같은 철자읽기가 나올 수 있어서
const speakRU = async (t, s) => {
  await ensureVoicesLoaded();

  const txt = normalizeRuTtsText(t);
  const wobble = needsAntiWobbleRu(txt);

  const baseRate = s?.ttsRate ?? 1;
  const basePitch = s?.ttsPitch ?? 1;

  // 🔧 안정 보정
  const rate = wobble
    ? Math.max(1.02, baseRate) // 약간 빠르게
    : Math.max(0.95, baseRate);

  const pitch = wobble
    ? basePitch === 1
      ? 0.88
      : basePitch // 약간 낮춰서 떨림 억제
    : basePitch === 1
    ? 0.9
    : basePitch;

  return speak(txt, "ru-RU", {
    voiceName: s?.ruVoiceName,
    volume: s?.ttsVolume,
    rate,
    pitch,
    cancelBeforeSpeak: false,
  });
};

const speakKO = async (t, s) => {
  await ensureVoicesLoaded();
  return speak(t, "ko-KR", {
    voiceName: s?.koVoiceName,
    volume: s?.ttsVolume,
    rate: s?.ttsRate,
    pitch: s?.ttsPitch,
    cancelBeforeSpeak: s?.cancelBeforeSpeak,
  });
};
// ====== Audio Blob Store (IndexedDB) ======
const AUDIO_DB = {
  name: "rusdrops_audio_db_v1",
  store: "audio",
  ver: 1,
};

// idb open
function openAudioDB() {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(AUDIO_DB.name, AUDIO_DB.ver);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(AUDIO_DB.store)) {
          db.createObjectStore(AUDIO_DB.store, { keyPath: "key" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

async function idbPutAudio({ key, blob, mime, updatedAt }) {
  const db = await openAudioDB();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(AUDIO_DB.store, "readwrite");
      tx.objectStore(AUDIO_DB.store).put({
        key,
        blob,
        mime: mime || blob?.type || "audio/mpeg",
        updatedAt: updatedAt || Date.now(),
      });
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    } catch (e) {
      try {
        db.close();
      } catch {}
      reject(e);
    }
  });
}

async function idbGetAudio(key) {
  if (!key) return null;
  const db = await openAudioDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(AUDIO_DB.store, "readonly");
      const req = tx.objectStore(AUDIO_DB.store).get(key);
      req.onsuccess = () => {
        const v = req.result || null;
        try {
          db.close();
        } catch {}
        resolve(v);
      };
      req.onerror = () => {
        try {
          db.close();
        } catch {}
        resolve(null);
      };
    } catch {
      try {
        db.close();
      } catch {}
      resolve(null);
    }
  });
}

async function idbDeleteAudio(key) {
  if (!key) return;
  const db = await openAudioDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(AUDIO_DB.store, "readwrite");
      tx.objectStore(AUDIO_DB.store).delete(key);
      tx.oncomplete = () => {
        try {
          db.close();
        } catch {}
        resolve(true);
      };
      tx.onerror = () => {
        try {
          db.close();
        } catch {}
        resolve(false);
      };
    } catch {
      try {
        db.close();
      } catch {}
      resolve(false);
    }
  });
}
// ✅ (추가) 녹음/업로드 Blob을 IndexedDB에 저장하고 key를 반환
async function saveAudioBlob(blob, editId) {
  if (!blob) throw new Error("blob 없음");

  // 업로드처럼 키 규칙 통일
  const key = `a_${editId}_${Date.now()}`;

  await idbPutAudio({
    key,
    blob,
    mime: blob.type || "audio/webm",
    updatedAt: Date.now(),
  });

  return key;
}

// Blob -> base64 (export 용)
function blobToBase64(blob) {
  return new Promise((resolve) => {
    try {
      const fr = new FileReader();
      fr.onload = () => {
        const dataUrl = String(fr.result || "");
        // data:audio/mpeg;base64,xxxx 형태
        const base64 = dataUrl.split(",")[1] || "";
        resolve(base64);
      };
      fr.onerror = () => resolve("");
      fr.readAsDataURL(blob);
    } catch {
      resolve("");
    }
  });
}

// base64 -> Blob (import 용)
function base64ToBlob(base64, mime = "audio/mpeg") {
  try {
    const bin = atob(base64);
    const len = bin.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = bin.charCodeAt(i);
    return new Blob([buf], { type: mime });
  } catch {
    return null;
  }
}

// ====== MP3 Audio (URL) + fallback to TTS ======
function normalizeAudioUrl(url) {
  const u = (url || "").trim();
  if (!u) return "";

  try {
    // 구글 드라이브 ID 추출 (다양한 패턴 대응)
    const driveMatch = u.match(/(?:id=|\/d\/|\/file\/d\/)([-_\w]{25,})/i);
    if (driveMatch && driveMatch[1]) {
      // ✅ 반드시 이 형태여야만 브라우저가 직접 재생 가능합니다.
      return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
    }

    if (/dropbox\.com/i.test(u)) {
      return u.replace("?dl=0", "?raw=1");
    }
  } catch (e) {
    console.error("URL 변환 오류:", e);
  }
  return u;
}
function stopAllAudio(audioRef) {
  try {
    window.speechSynthesis?.cancel();
  } catch {}
  try {
    if (audioRef?.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      audioRef.current = null;
    }
  } catch {}
}

async function tryPlayUrlAudio(
  url,
  audioRef,
  { volume = 1, token, isPlayerAlive } = {}
) {
  const src = normalizeAudioUrl(url);
  if (!src) return false;

  const alive = () =>
    typeof token === "number" && typeof isPlayerAlive === "function"
      ? isPlayerAlive(token)
      : true;

  console.log("▶️ [MP3 시도] 주소:", src);

  return new Promise((resolve) => {
    try {
      // ✅ TTS가 남아있으면 덕킹/볼륨 억제 유발 가능 → speaking/pending일 때만 정리
      try {
        const synth = window.speechSynthesis;
        if (synth) {
          if (synth.speaking || synth.pending) synth.cancel();
          synth.resume?.();
        }
      } catch {}
      // 기존 오디오 정리
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
      } catch {}

      const a = audioRef.current || new Audio();
      audioRef.current = a;

      a.playsInline = true;
      a.setAttribute("playsinline", "");
      a.setAttribute("webkit-playsinline", "");

      a.preload = "auto";
      a.muted = false;
      a.volume = volume;
      a.currentTime = 0;

      let settled = false;
      const done = (ok) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };

      a.onended = () => {
        console.log("🏁 [MP3 완료]");
        done(true);
      };

      a.onerror = () => {
        console.error("❌ [MP3 로드 에러]");
        done(false);
      };

      // ✅ 초반 씹힘/볼륨 램프 완화: canplay(또는 loadeddata)까지 짧게 대기 후 play
      const waitCanPlay = () =>
        new Promise((res) => {
          let finished = false;
          const cleanup = () => {
            if (finished) return;
            finished = true;
            a.removeEventListener("canplay", on);
            a.removeEventListener("loadeddata", on);
            res();
          };
          const on = () => cleanup();
          a.addEventListener("canplay", on, { once: true });
          a.addEventListener("loadeddata", on, { once: true });
          setTimeout(cleanup, 700); // 너무 오래 기다리면 UX 나빠서 상한
        });

      // src 지정
      a.src = src;
      try {
        a.load?.();
      } catch {}

      (async () => {
        await waitCanPlay();
        if (!alive()) return done(false);

        // ✅ play() 직전에도 볼륨 확정
        try {
          a.muted = false;
          a.volume = volume;
          if (a.currentTime > 0.01) a.currentTime = 0;
        } catch {}

        const p = a.play();
        if (p && typeof p.then === "function") {
          p.then(() => {
            console.log("✅ [MP3 재생 시작]");
          }).catch((e) => {
            console.warn("⚠️ [MP3 play() 실패]", e?.name, e?.message);
            done(false);
          });
        }
      })();

      // 타임아웃(시작 자체가 안 되면 실패)
      setTimeout(() => {
        if (!alive()) return done(false);
        if (a.paused) {
          console.log("⏰ [MP3 타임아웃] TTS로 전환");
          done(false);
        }
      }, 5000);
    } catch (err) {
      console.error("Critical Error:", err);
      resolve(false);
    }
  });
}

async function tryPlayBlobAudio(
  audioKey,
  audioRef,
  { volume = 1, token, isPlayerAlive } = {}
) {
  if (!audioKey) return false;

  const alive = () =>
    typeof token === "number" && typeof isPlayerAlive === "function"
      ? isPlayerAlive(token)
      : true;

  const rec = await idbGetAudio(audioKey);
  if (!rec?.blob) return false;
  if (!alive()) return false;

  return new Promise((resolve) => {
    try {
      // ✅ TTS 정리(덕킹/볼륨 억제 방지) - speaking/pending일 때만
      try {
        const synth = window.speechSynthesis;
        if (synth) {
          if (synth.speaking || synth.pending) synth.cancel();
          synth.resume?.();
        }
      } catch {}
      // 기존 오디오 정리
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
      } catch {}

      const a = audioRef.current || new Audio();
      audioRef.current = a;

      a.playsInline = true;
      a.setAttribute("playsinline", "");
      a.setAttribute("webkit-playsinline", "");

      const url = URL.createObjectURL(rec.blob);

      a.preload = "auto";
      a.muted = false;
      a.volume = volume;
      a.currentTime = 0;
      a.src = url;

      let settled = false;
      const done = (ok) => {
        if (settled) return;
        settled = true;
        try {
          URL.revokeObjectURL(url);
        } catch {}
        resolve(ok);
      };

      a.onended = () => done(true);
      a.onerror = () => done(false);

      const waitCanPlay = () =>
        new Promise((res) => {
          let finished = false;
          const cleanup = () => {
            if (finished) return;
            finished = true;
            a.removeEventListener("canplay", on);
            a.removeEventListener("loadeddata", on);
            res();
          };
          const on = () => cleanup();
          a.addEventListener("canplay", on, { once: true });
          a.addEventListener("loadeddata", on, { once: true });
          setTimeout(cleanup, 500);
        });

      (async () => {
        await waitCanPlay();
        if (!alive()) return done(false);

        // play 직전 볼륨 확정
        try {
          a.muted = false;
          a.volume = volume;
          if (a.currentTime > 0.01) a.currentTime = 0;
        } catch {}

        const p = a.play();
        if (p && typeof p.then === "function") {
          p.catch(() => done(false));
        }
      })();

      // 시작 실패 타임아웃
      setTimeout(() => {
        if (!alive()) return done(false);
        if (a.paused) done(false);
      }, 3000);
    } catch {
      resolve(false);
    }
  });
}

// ====== SRS / Queue ======
function sm2(card, quality) {
  let { reps = 0, interval = 0, ef = 2.5 } = card;
  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 3;
    else interval = Math.round(interval * ef);
    ef = clamp(
      ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
      1.3,
      2.8
    );
    reps += 1;
  }
  return {
    ...card,
    reps,
    interval,
    ef,
    due: now() + interval * 86400000,
    last: now(),
    seen: true,
  };
}
function priorityMarkWeight(mark) {
  if (mark === MARKS.red) return 0;
  if (mark === MARKS.yellow) return 1;
  if (mark === MARKS.green) return 2;
  return 3;
}
function nextQueue(words, settings) {
  const _now = now();
  const due = words.filter((w) => !w.due || w.due <= _now);
  const fresh = words.filter((w) => !w.seen).slice(0, settings.dailyNewLimit);
  const uniq = Array.from(
    new Map([...due, ...fresh].map((w) => [w.id, w])).values()
  );

  if (settings.redFirst) {
    return uniq.sort((a, b) => {
      const aDueFirst = !a.due || a.due <= _now ? 0 : 1;
      const bDueFirst = !b.due || b.due <= _now ? 0 : 1;
      if (aDueFirst !== bDueFirst) return aDueFirst - bDueFirst;
      const aw = priorityMarkWeight(a.mark);
      const bw = priorityMarkWeight(b.mark);
      if (aw !== bw) return aw - bw;
      const ad = a.due ?? Number.POSITIVE_INFINITY;
      const bd = b.due ?? Number.POSITIVE_INFINITY;
      return ad - bd;
    });
  }
  return uniq.sort((a, b) => (a.due ?? 0) - (b.due ?? 0));
}

// ====== 영→러 변환 ======
function translitToRu(input) {
  if (!input) return "";
  let s = input;
  const map = [
    [/shch/gi, "щ"],
    [/sch/gi, "щ"],
    [/yo/gi, "ё"],
    [/yu/gi, "ю"],
    [/ya/gi, "я"],
    [/ye/gi, "е"],
    [/zh/gi, "ж"],
    [/kh/gi, "х"],
    [/ts/gi, "ц"],
    [/ch/gi, "ч"],
    [/sh/gi, "ш"],
  ];
  map.forEach(([a, b]) => {
    s = s.replace(a, b);
  });
  const single = {
    a: "а",
    b: "б",
    v: "в",
    g: "г",
    d: "д",
    e: "е",
    z: "з",
    i: "и",
    j: "й",
    k: "к",
    l: "л",
    m: "м",
    n: "н",
    o: "о",
    p: "п",
    r: "р",
    s: "с",
    t: "т",
    u: "у",
    f: "ф",
    h: "х",
    y: "ы",
    c: "к",
  };
  s = s.replace(/[A-Za-z]/g, (ch) => single[ch.toLowerCase()] || ch);
  return s;
}

// ====== Firebase(compat) loader stub ======
async function loadFirebaseCompat() {
  if (window.firebase?.apps?.length) return window.firebase;
  const urls = [
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js",
  ];
  for (const src of urls) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  return window.firebase;
}

export default function App() {
  // ✅ Hide CodeSandbox injected "Open Sandbox" overlay (mobile/preview only)
  useEffect(() => {
    const kill = () => {
      // Remove elements that look like CodeSandbox "Open Sandbox" widgets
      const all = document.querySelectorAll("a, button, div, span");
      all.forEach((el) => {
        const t = (el.textContent || "").trim();
        if (!t) return;

        const looksLikeOpenSandbox =
          t === "Open Sandbox" || t.toLowerCase().includes("open sandbox");

        const href = el.tagName === "A" ? el.getAttribute("href") || "" : "";
        const looksLikeCsbLink =
          href.includes("codesandbox.io") || href.includes("csb.app");

        if (looksLikeOpenSandbox || looksLikeCsbLink) {
          const target = el.closest("a") || el.closest("div") || el;
          // extra guard: only remove top-level injected widgets (avoid app content)
          if (
            target &&
            (target.parentElement === document.body ||
              target.closest("body") === document.body)
          ) {
            target.remove();
          } else if (
            target &&
            target.closest("a[href*='codesandbox'], a[href*='csb.app']")
          ) {
            target.remove();
          }
        }
      });
    };

    // initial sweep + observe for reinjection
    kill();
    const obs = new MutationObserver(() => kill());
    obs.observe(document.body, { childList: true, subtree: true });

    return () => obs.disconnect();
  }, []);

  // ===== Theme =====
  const [theme, setTheme] = useState(() => load(STORAGE.theme, DEFAULT_THEME));
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const recordingRef = useRef(false);
  const recordingWordIdRef = useRef(""); // 어떤 단어를 녹음 중인지

  useEffect(() => {
    applyTheme(theme);
    save(STORAGE.theme, theme);
  }, [theme]);

  // ===== Settings/Words =====
  const [settings, setSettings] = useState(() =>
    load(STORAGE.settings, DEFAULT_SETTINGS)
  );

  // ✅ migrate: add srsDirection if missing (ver27.0.10)
  const _didMigrateSrsDirection = useRef(false);
  useEffect(() => {
    if (_didMigrateSrsDirection.current) return;
    _didMigrateSrsDirection.current = true;
    if (!settings?.srsDirection) {
      setSettings((s) => ({ ...s, srsDirection: "RU_KO" }));
    }
  }, [settings, setSettings]);
  // ✅ migrate old default (RU x2) -> new default (RU x3) once
  const _didMigrateRepeatRU = useRef(false);
  useEffect(() => {
    if (_didMigrateRepeatRU.current) return;
    if (!settings) return;
    if (settings.repeatRU === 2) {
      _didMigrateRepeatRU.current = true;
      setSettings((prev) => ({ ...prev, repeatRU: 3 }));
    }
  }, [settings?.repeatRU]);

  const [words, setWords] = useState(() => {
    const arr = load(STORAGE.words, []);
    return (arr || []).map((w) => ({
      folder: DEFAULT_FOLDER,
      mark: null,
      ruAudio: "",
      audioKey: "",
      audioMime: "",
      ...w,
      folder: w.folder || DEFAULT_FOLDER,
      mark: w.mark || null,
      ruAudio: w.ruAudio || "",
      audioKey: w.audioKey || "",
      audioMime: w.audioMime || "",
      mp3Source: w.mp3Source || "", // ✅ 과거 데이터 보호
    }));
  });
  useEffect(() => save(STORAGE.words, words), [words]);
  useEffect(() => save(STORAGE.settings, { ...settings }), [settings]);

  // ===== Top Import Bar (UI) =====
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [srsSettingsOpen, setSrsSettingsOpen] = useState(false);
  const [appSettingsOpen, setAppSettingsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  // ✅ Apply-to-all folder defaults (Settings UI)
  const [applyAllRU, setApplyAllRU] = useState(() => settings?.repeatRU ?? 3);
  const [applyAllKO, setApplyAllKO] = useState(() => settings?.repeatKO ?? 1);
  const [applyAllOrder, setApplyAllOrder] = useState(() => "KO_RU"); // KO→RU 기본

  // ✅ Apply selected RU/KO repeats & direction to ALL folders
  const applyDefaultFolderPlayPrefsAll = () => {
    try {
      const label = applyAllOrder === "KO_RU" ? "KO→RU" : "RU→KO";
      const ok = window.confirm(
        `모든 폴더에 아래 값을 적용할까요?\nRU x${applyAllRU}, KO x${applyAllKO}, 방향: ${label}`
      );
      if (!ok) return;

      setSettings((prev) => {
        const base = prev || {};
        const curMap = base.folderPlayPrefs || {};
        const nextMap = { ...curMap };

        // allFolders: ["모두", ...folderNames]
        const folderNames = (allFolders || []).filter((f) => f && f !== "모두");

        folderNames.forEach((f) => {
          const cur = nextMap[f] || {};
          nextMap[f] = {
            ...cur,
            repeatRU: Number(applyAllRU) || 3,
            repeatKO: Number(applyAllKO) || 1,
            bulkOrder: applyAllOrder || "KO_RU",
          };
        });

        return { ...base, folderPlayPrefs: nextMap };
      });
    } catch (e) {
      console.error(e);
      alert("적용 중 오류가 발생했어요. 콘솔을 확인해 주세요.");
    }
  };
  const [importFolder, setImportFolder] = useState("");

  const folderOptions = useMemo(() => {
    return Array.from(
      new Set((words || []).map((w) => w.folder || DEFAULT_FOLDER))
    ).sort((a, b) => a.localeCompare(b));
  }, [words]);

  // ===========================
  // ✅ Folder Play Preferences (v2)
  // - 폴더별로 "일괄재생 설정 + 신호등 필터"를 기억
  // - 폴더에 저장값이 없으면 글로벌 settings 값을 기본으로 사용
  // ===========================
  function getFolderPlayPref(folder) {
    const key = folder || DEFAULT_FOLDER;
    const map = settings?.folderPlayPrefs || {};
    const saved = map[key] || {};

    const base = {
      bulkOrder: "KO_RU", // "RU_KO" | "KO_RU"
      playOrder: "asc", // "asc" | "desc" | "shuffle"
      repeatRU: 3, // ✅ 기본값: RU x3 (폴더 저장값 없을 때)
      repeatKO: 1, // ✅ 기본값: KO x1 (폴더 저장값 없을 때)
      loopRounds: settings?.loopRounds ?? 1,
      gapMs: settings?.gapMs ?? 1000,

      ttsRate: settings?.ttsRate ?? 1,
      ttsPitch: settings?.ttsPitch ?? 1,

      // 신호등 모드: all(기본) | g | y | r | yr
      tlMode: "on",
    };

    return { ...base, ...saved };
  }

  // ===========================
  // ✅ Traffic-light (folder filter) helpers
  // 순서: off(미학습) > g > y > yr(노+빨) > r > on(불켜짐) > all(전체)
  // ===========================
  function nextTlMode(mode) {
    const cur = mode || "all";
    if (cur === "off") return "g";
    if (cur === "g") return "y";
    if (cur === "y") return "yr";
    if (cur === "yr") return "r";
    if (cur === "r") return "on";
    if (cur === "on") return "all";
    return "off";
  }
  function tlModeToAllowedMarks(mode) {
    const m = mode || "all";
    if (m === "g") return new Set(["green"]);
    if (m === "y") return new Set(["yellow"]);
    if (m === "r") return new Set(["red"]);
    if (m === "yr") return new Set(["yellow", "red"]);
    return null; // all = 전체 표시/재생
  }

  function patchFolderPlayPref(folder, patch) {
    const key = folder || DEFAULT_FOLDER;

    setSettings((s) => {
      const prefs = { ...(s?.folderPlayPrefs || {}) };
      const cur = prefs[key] || {};
      prefs[key] = { ...cur, ...(patch || {}) };

      return {
        ...s,
        folderPlayPrefs: prefs,
      };
    });
  }

  // ===========================
  // ✅ Folder View Prefs (기본/가독성 모드)
  // ===========================
  function getFolderViewPref(folder) {
    const key = folder || DEFAULT_FOLDER;
    const map = settings?.folderViewPrefs || {};
    const saved = map[key] || {};
    return {
      readMode: false, // false=기본(가로), true=가독성(2줄)
      pinned: false, // 📍 고정
      favorite: false, // ⭐ 즐겨찾기
      ...saved,
    };
  }

  function patchFolderViewPref(folder, patch) {
    const key = folder || DEFAULT_FOLDER;

    setSettings((s) => {
      const prefs = { ...(s?.folderViewPrefs || {}) };
      const cur = prefs[key] || {};
      prefs[key] = { ...cur, ...(patch || {}) };

      return {
        ...s,
        folderViewPrefs: prefs,
      };
    });
  }

  function isReadMode(folder) {
    return !!getFolderViewPref(folder)?.readMode;
  }

  // ===== Voices (iOS-safe) =====
  const [voices, setVoices] = useState([]);
  const audioRef = useRef(null);

  // iOS에서 voices가 늦게 뜨거나 이벤트가 안 뜨는 경우가 많아서
  // 이벤트 + 폴링을 같이 씁니다.
  useEffect(() => {
    const s = window.speechSynthesis;
    if (!s) return;

    let alive = true;
    let timer = null;

    const read = () => {
      if (!alive) return;
      const list = s.getVoices ? s.getVoices() : [];
      if (Array.isArray(list) && list.length) {
        setVoices(list);
        return true;
      }
      return false;
    };

    const onChanged = () => read();

    // 이벤트 방식 (브라우저별로 다르게 동작)
    try {
      s.addEventListener?.("voiceschanged", onChanged);
    } catch {}
    // 일부 Safari는 프로퍼티로만 받는 경우가 있어 같이 설정
    const prev = s.onvoiceschanged;
    s.onvoiceschanged = onChanged;

    // 최초 1회
    read();

    // iOS/Safari 대응: 짧게 폴링 (최대 약 3~4초)
    let tries = 0;
    timer = window.setInterval(() => {
      tries += 1;

      // 이미 잡혔으면 중단
      if (read()) {
        clearInterval(timer);
        timer = null;
        return;
      }

      // 너무 오래 돌지 않게 제한
      if (tries >= 40) {
        clearInterval(timer);
        timer = null;
      }
    }, 100);

    return () => {
      alive = false;
      if (timer) clearInterval(timer);
      try {
        s.removeEventListener?.("voiceschanged", onChanged);
      } catch {}
      // 원복
      s.onvoiceschanged = prev || null;
    };
  }, []);

  // (선택) iOS에서 음성 목록이 비어있다면,
  // 사용자가 버튼 한 번 눌러서 "TTS 깨우기" 할 때 호출하세요.
  function unlockVoicesIOS() {
    const s = window.speechSynthesis;
    if (!s) return;

    try {
      s.cancel();
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0; // 소리 안 나게
      u.rate = 1;
      u.pitch = 1;
      s.speak(u);

      // speak 이후에 voices가 잡히는 경우가 있어 약간 뒤에 다시 읽기
      setTimeout(() => {
        try {
          const list = s.getVoices?.() || [];
          if (list.length) setVoices(list);
        } catch {}
      }, 200);
    } catch {}
  }

  // ===== Folders =====
  const allFolders = useMemo(() => {
    const set = new Set(words.map((w) => w.folder || DEFAULT_FOLDER));
    return ["모두", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [words]);

  // ===== Stats =====
  const totalWords = words.length;
  const dueCount = words.filter((w) => !w.due || w.due <= now()).length;
  const startOfToday = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const todayReviewed = words.filter(
    (w) => w.last && w.last >= startOfToday
  ).length;
  const cnt = { green: 0, yellow: 0, red: 0 };
  words.forEach((w) => {
    if (w.mark && cnt[w.mark] !== undefined) cnt[w.mark]++;
  });
  const totalMarked = cnt.green + cnt.yellow + cnt.red;
  const ratio = (n) => (totalMarked ? Math.round((n / totalMarked) * 100) : 0);

  // ===== Session =====
  const [sessionOn, setSessionOn] = useState(false);
  const [sessionList, setSessionList] = useState([]);
  const [idx, setIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);
  // ===== SRS extra modes =====
  const [typedAnswer, setTypedAnswer] = useState("");
  const [choiceOptions, setChoiceOptions] = useState([]);
  const [pickedOption, setPickedOption] = useState(null);
  const [answerOk, setAnswerOk] = useState(null); // null | true | false
  const current = sessionList[idx] || null;

  const imgEmoji =
    current && current.img && !/^https?:\/\//.test(current.img)
      ? extractFirstEmoji(current.img)
      : "";
  const ipaEmoji = current ? extractFirstEmoji(current.ipa || "") : "";
  const koEmoji = current ? extractFirstEmoji(current.ko || "") : "";
  const thumbEmoji = imgEmoji || (!current?.img && ipaEmoji) || koEmoji;

  const buildChoices = (cur, pool, n = 4) => {
    const correct =
      settings.srsDirection === "KO_RU" ? cur?.ko || "" : cur?.ru || "";
    // For choice/type/dict we focus on RU answer (RU string)
    const answer = cur?.ru || "";
    const cand = pool.map((w) => w?.ru).filter((x) => x && x !== answer);
    // shuffle
    for (let i = cand.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cand[i], cand[j]] = [cand[j], cand[i]];
    }
    const opts = [answer, ...cand.slice(0, Math.max(0, n - 1))];
    // shuffle options (keep stable if shuffleChoices false)
    if (settings.shuffleChoices !== false) {
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
    }
    return opts;
  };

  const normRuStr = (s) =>
    (s || "")
      .trim()
      .toLowerCase()
      .normalize("NFC")
      .replace(/ё/g, "е")
      .replace(/\s+/g, " ");

  function startSession(opts = {}) {
    const forceIgnoreDue = !!opts.forceIgnoreDue;
    if (!words.length) return alert("먼저 단어를 추가하세요.");

    const pool =
      settings.sessionFolder && settings.sessionFolder !== "모두"
        ? words.filter(
            (w) => (w.folder || DEFAULT_FOLDER) === settings.sessionFolder
          )
        : words.slice();

    let list;
    const order = settings.sessionOrder;
    if (order === "added" || forceIgnoreDue)
      list = pool.slice().sort((a, b) => a.created - b.created);
    else list = nextQueue(pool, settings);

    const n = Math.max(0, parseInt(settings.sessionCount || 0, 10));
    if (n > 0) list = list.slice(0, n);

    if (!list.length) {
      alert("선택된 조건에 해당하는 카드가 없습니다.");
      return;
    }
    setSessionList(list);
    setIdx(0);
    setShowBack(false);
    setSessionOn(true);
    setTypedAnswer("");
    setPickedOption(null);
    setAnswerOk(null);
    if (settings.mode === "choice")
      setChoiceOptions(buildChoices(list[0], list));
    // ✅ 자동 재생: 인식(RU→KO) 또는 받아쓰기만
    setTimeout(() => {
      if (
        settings.mode === "dict" ||
        (settings.mode === "learn" && settings.srsDirection === "RU_KO")
      ) {
        if (list[0]?.ru) speakRU(list[0].ru, settings);
      }
    }, 0);
  }

  function stopSession() {
    // 사용자가 중지 눌렀을 때 즉시 종료
    setSessionOn(false);
    setSessionList([]);
    setIdx(0);
    setShowBack(false);
    onStop(); // ✅ TTS + mp3 모두 정지(이미 너 코드에 있음)
  }

  function prevCard() {
    if (!sessionOn) return;
    const n = Math.max(0, idx - 1);
    setIdx(n);
    setShowBack(false);
    setTypedAnswer("");
    setPickedOption(null);
    setAnswerOk(null);
    if (settings.mode === "choice")
      setChoiceOptions(buildChoices(sessionList[n], sessionList));
    if (sessionList[n]) {
      if (
        settings.mode === "dict" ||
        (settings.mode === "learn" && settings.srsDirection === "RU_KO")
      ) {
        speakRU(sessionList[n].ru, settings);
      }
    }
  }
  function nextCard() {
    if (!sessionOn) return;
    const atLast = idx >= sessionList.length - 1;
    if (atLast) {
      if (settings.sessionAutoRepeat) {
        startSession({ forceIgnoreDue: true });
      } else {
        stopSession();
      }
      return;
    }
    const n = idx + 1;
    setIdx(n);
    setShowBack(false);
    setTypedAnswer("");
    setPickedOption(null);
    setAnswerOk(null);
    if (settings.mode === "choice")
      setChoiceOptions(buildChoices(sessionList[n], sessionList));
    if (sessionList[n]) {
      if (
        settings.mode === "dict" ||
        (settings.mode === "learn" && settings.srsDirection === "RU_KO")
      ) {
        speakRU(sessionList[n].ru, settings);
      }
    }
  }

  const [pendingGrade, setPendingGrade] = useState(null);
  function frontChoice(q) {
    setPendingGrade(q);
    setShowBack(true);
    setAnswerOk(null);
    if (!current) return;
    // ✅ reveal voice depends on mode/direction
    if (settings.mode === "learn") {
      if (settings.srsDirection === "RU_KO") speakKO(current.ko, settings);
      else speakRU(current.ru, settings);
    } else {
      // other modes: reveal correct RU
      if (current.ru) speakRU(current.ru, settings);
    }
  }
  function backChoice(q) {
    if (!current) return;
    const quality = q ?? pendingGrade ?? 3;
    applyGrade(quality, current);
    setPendingGrade(null);
    if (idx >= sessionList.length - 1) stopSession();
    else nextCard();
  }
  function applyGrade(quality, w) {
    const mark =
      quality >= 5 ? MARKS.green : quality === 3 ? MARKS.yellow : MARKS.red;
    const next = sm2(w, quality);
    setWords((ws) => ws.map((x) => (x.id === w.id ? { ...next, mark } : x)));
    saveProgressCloud(w.id, {
      reps: next.reps,
      interval: next.interval,
      ef: next.ef,
      due: next.due,
      last: next.last,
      seen: true,
      mark,
    });
  }

  // ✅ iOS에서 speechSynthesis 후 audio.play()가 막히는 케이스 방지용 "오디오 프라임"
  // - runPlayerFrom()이 사용자 탭(gesture)로 시작될 때 "첫 await 전에" 1번 호출해야 효과가 큼
  function primeAudioUnlock(audioRef) {
    try {
      const a = audioRef.current || new Audio();
      audioRef.current = a;

      // iOS inline play 힌트
      a.playsInline = true;
      a.setAttribute("playsinline", "");
      a.setAttribute("webkit-playsinline", "");

      // 짧은 무음(거의 모든 브라우저에서 안전)
      // 1) 이미 src가 있으면 건드리지 않기 (현재 재생 중일 수 있음)
      // 2) 없으면 무음 data URI로 한번 "play 시도"만 해도 unlock되는 경우가 많음
      if (!a.src) {
        a.src =
          "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
        a.preload = "auto";
      }

      const prevVol = a.volume;
      a.volume = 0;

      // 중요: 여기서 await 하면 gesture 컨텍스트가 끊길 수 있어서 "await 금지"
      const p = a.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          try {
            a.pause();
            a.currentTime = 0;
            a.volume = prevVol;
          } catch {}
        }).catch(() => {
          try {
            a.volume = prevVol;
          } catch {}
        });
      } else {
        // 구형 브라우저 fallback
        try {
          a.pause();
          a.currentTime = 0;
          a.volume = prevVol;
        } catch {}
      }
    } catch {}
  }

  // ✅ iOS 오디오 잠금 해제(유저 터치 순간에 1회 실행하면 효과 큼)
  function unlockIOSAudio(audioRef) {
    try {
      const a = audioRef.current || new Audio();
      audioRef.current = a;

      // iOS에서 inline 재생 관련
      a.playsInline = true;
      a.setAttribute("playsinline", "");
      a.setAttribute("webkit-playsinline", "");

      // 무음으로 아주 짧게 재생 시도 → unlock
      const prevMuted = a.muted;
      const prevVol = a.volume;

      a.muted = true;
      a.volume = 0;

      // src 없어도 되는 경우가 많지만, 확실히 하려면 빈 mp3가 필요함.
      // 대부분 환경에선 src 없이 play/pause만으로도 unlock 됨.
      const p = a.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          a.pause();
          a.currentTime = 0;
          a.muted = prevMuted;
          a.volume = prevVol;
        }).catch(() => {
          // 실패해도 무시 (iOS 버전에 따라 다름)
          a.muted = prevMuted;
          a.volume = prevVol;
        });
      } else {
        // 구형
        a.pause();
        a.currentTime = 0;
        a.muted = prevMuted;
        a.volume = prevVol;
      }
    } catch {
      // ignore
    }
  }

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const playIndexRef = useRef(0);
  const abortRef = useRef(false);
  useEffect(() => () => onStop(), []); // cleanup on unmount

  // ✅ 재생 세션 토큰: Stop/재시작 시 이전 await들이 다음 단계로 못 넘어가게 차단
  const playerTokenRef = useRef(0);
  const bumpPlayerToken = () => {
    playerTokenRef.current += 1;
    return playerTokenRef.current;
  };
  const isPlayerAlive = (token) =>
    !abortRef.current && playerTokenRef.current === token;

  function gapWithRamp(base, progress, mode) {
    const b = clamp(base, 100, 5000);
    if (mode === "accel")
      return clamp(Math.round(b * (1 - 0.5 * progress)), 100, 5000);
    if (mode === "decel")
      return clamp(Math.round(b * (1 + 0.5 * progress)), 100, 5000);
    return b;
  }

  // ✅ iOS Safari: speechSynthesis 후에 audio.play()가 막히는 경우가 있어서
  // "재생 시작(사용자 클릭)" 순간에 오디오를 미리 unlock 해둔다.
  async function unlockAudioForIOS(audioRef) {
    try {
      const a = audioRef.current;
      if (!a) return;

      // 아주 짧은 무음 wav (데이터 0)
      const SILENT_WAV =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

      const prevMuted = a.muted;
      const prevVol = a.volume;
      const prevSrc = a.src;

      a.muted = true;
      a.volume = 0;
      a.src = SILENT_WAV;

      // play()가 성공하면 오디오 세션 unlock
      const p = a.play();
      if (p && typeof p.then === "function") await p;
      a.pause();

      // 원복
      a.muted = prevMuted;
      a.volume = prevVol;
      a.src = prevSrc;
      a.currentTime = 0;
    } catch {
      // 실패해도 그냥 무시 (환경별로 다름)
    }
  }

  // ✅ Stop 토큰을 인지하는 playRU (v1.6.x hotfix)
  async function playRU(wOrText, token, eff = settings) {
    // token이 들어오면, 중간중간 Stop 여부를 확인하는 헬퍼
    const alive = () =>
      typeof token === "number" ? isPlayerAlive(token) : true;

    // 1) 단순 문자열은 RU TTS만
    if (typeof wOrText === "string") {
      if (!alive()) return;
      await speakRU(wOrText, eff);
      return;
    }

    const w = wOrText;
    if (!alive()) return;

    // ✅ mp3 재생 전에, 남아있는 TTS가 “덕킹/볼륨 억제”를 만들 수 있어 정리하되,
    //    (iOS/일부 환경) 무조건 cancel()을 반복 호출하면 다음 KO TTS가 묵음이 되는 케이스가 있어
    //    speaking/pending일 때만 cancel + 이후 resume로 복구
    try {
      const synth = window.speechSynthesis;
      if (synth) {
        if (synth.speaking || synth.pending) synth.cancel();
        synth.resume?.();
      }
    } catch {}
    // ✅ 2) IndexedDB Blob 우선
    if (w.audioKey) {
      const ok = await tryPlayBlobAudio(w.audioKey, audioRef, {
        volume: eff.ttsVolume ?? 1,
        token,
        isPlayerAlive,
      });
      if (!alive()) return; // ✅ Stop 눌렸으면 fallback 금지
      if (ok) return;
    }

    // 3) URL 스트리밍 시도
    if (w.ruAudio && w.ruAudio.trim() !== "") {
      const ok = await tryPlayUrlAudio(w.ruAudio, audioRef, {
        volume: eff.ttsVolume ?? 1,
        token,
        isPlayerAlive,
      });
      if (!alive()) return; // ✅ Stop 눌렸으면 fallback 금지
      if (ok) return;
    }

    // ✅ 4) 최후: RU TTS (Stop이면 절대 실행 안 함)
    if (!alive()) return;
    await speakRU(w.ru, eff);
  }

  // ✅ 반복 재생 블록(Stop 시 다음 단계로 넘어가지 않도록 token 가드 포함)
  async function playRURepeats(w, gap, token, eff = settings) {
    for (let r = 0; r < (eff.repeatRU ?? 1); r++) {
      while (isPausedRef.current && isPlayerAlive(token)) await sleep(120);
      if (!isPlayerAlive(token)) return;

      await playRU(w, token, eff);
      if (!isPlayerAlive(token)) return;

      // await가 풀린 뒤에도 Stop이 눌렸을 수 있음 → 다음 단계 차단
      if (!isPlayerAlive(token)) return;

      await sleep(gap);
      if (!isPlayerAlive(token)) return;
    }
  }

  async function playKORepeats(w, gap, token, eff = settings) {
    for (let k = 0; k < (eff.repeatKO ?? 1); k++) {
      while (isPausedRef.current && isPlayerAlive(token)) await sleep(120);
      if (!isPlayerAlive(token)) return;

      // ✅ KO도 "끝날 때까지 기다리는" 버전 사용
      // (iOS/일부 환경) mp3→TTS 전환에서 TTS가 묵음이 되는 케이스가 있어 resume + 짧은 틈을 줌
      try {
        window.speechSynthesis?.resume?.();
      } catch {}
      await sleep(60);
      await speakKO(w.ko, eff);
      if (!isPlayerAlive(token)) return;

      await sleep(gap);
      if (!isPlayerAlive(token)) return;
    }
  }

  // ✅ NEW: 리스트를 직접 주입해서 재생 (폴더별 프리셋 반영용)
  async function runPlayerFromList(
    list,
    start = 0,
    pref,
    { skipStop = false } = {}
  ) {
    if (!skipStop) onStop();
    if (!Array.isArray(list) || list.length === 0) {
      return alert("재생할 항목이 없습니다.");
    }

    // ✅ 폴더 프리셋을 재생에 반영
    const bulkOrder = pref?.bulkOrder || "RU_KO";
    const eff = {
      ...settings,
      repeatRU: pref?.repeatRU ?? settings.repeatRU,
      repeatKO: pref?.repeatKO ?? settings.repeatKO,
      gapMs: pref?.gapMs ?? settings.gapMs,
    };

    playIndexRef.current = Math.max(0, Math.min(list.length - 1, start));

    setIsPlaying(true);
    setIsPaused(false);
    abortRef.current = false;

    const token = bumpPlayerToken();
    primeAudioUnlock(audioRef);
    try {
      window.speechSynthesis?.resume?.();
    } catch {}

    const rounds = clamp(parseInt(eff.loopRounds || 1), 1, 50);

    for (let round = 0; round < rounds && isPlayerAlive(token); round++) {
      for (
        let i = round === 0 ? playIndexRef.current : 0;
        i < list.length && isPlayerAlive(token);
        i++
      ) {
        const w = list[i];
        const progress = list.length > 1 ? i / (list.length - 1) : 0;

        const gap = gapWithRamp(
          eff.gapMs || 300,
          progress,
          eff.rampMode || "none"
        );

        if (bulkOrder === "KO_RU") {
          await playKORepeats(w, gap, token, eff);
          if (!isPlayerAlive(token)) break;
          await playRURepeats(w, gap, token, eff);
          if (!isPlayerAlive(token)) break;
        } else {
          await playRURepeats(w, gap, token, eff);
          if (!isPlayerAlive(token)) break;
          await playKORepeats(w, gap, token, eff);
          if (!isPlayerAlive(token)) break;
        }
      }
    }

    if (isPlayerAlive(token)) setIsPlaying(false);
  }

  function onPause() {
    setIsPaused(true);
  }

  function onResume() {
    setIsPaused(false);
  }

  function onStop() {
    // ✅ 먼저 세션을 완전히 끊는다
    abortRef.current = true;
    bumpPlayerToken();

    setIsPaused(false);
    setIsPlaying(false);

    // ✅ TTS 즉시 중단 + 큐 비우기
    try {
      window.speechSynthesis?.cancel();
    } catch {}

    // ✅ 오디오 즉시 중단
    stopAllAudio(audioRef);
  }

  // ✅ (선택) 랜덤을 "다시 섞기"용: 버튼에서 이거 호출하면 랜덤 순서가 새로 바뀜
  function reshuffle() {
    setShuffleSeed(Date.now());
  }

  // ===== Cloud =====
  const [cloud, setCloud] = useState(() =>
    load(STORAGE.cloud, {
      configured: !!load(STORAGE.fbConfig, null),
      enabled: true,
      liveSync: true,
      user: null,
      deckId: "",
      deckTitle: "",
      library: [],
      syncStatus: "",
    })
  );
  const cloudRef = useRef(cloud);
  useEffect(() => {
    cloudRef.current = cloud;
  }, [cloud]);

  const fbRef = useRef({ app: null, auth: null, db: null });
  useEffect(() => {
    const { user, ...persist } = cloud; // do not persist user object
    save(STORAGE.cloud, persist);
  }, [cloud]);

  async function ensureFirebase() {
    // 1) localStorage에 저장된 설정이 있으면 그걸 사용
    const saved = load(STORAGE.fbConfig, null);

    // 2) 없으면 코드에 박아둔 기본값 사용
    let config = saved || DEFAULT_FB_CONFIG || null;

    // 3) 기본값으로 초기화한 경우, localStorage에도 한 번 저장해 두면
    //    Cloud 패널의 설정 텍스트박스에서도 확인 가능
    if (!saved && DEFAULT_FB_CONFIG) {
      try {
        localStorage.setItem(
          STORAGE.fbConfig,
          JSON.stringify(DEFAULT_FB_CONFIG)
        );
      } catch {}
    }

    if (!config) {
      // 정말 아무 설정도 없을 때만 에러
      setCloud((c) => ({ ...c, configured: false }));
      throw new Error("Firebase config not set");
    }

    const firebase = await loadFirebaseCompat();

    if (!fbRef.current.app) {
      fbRef.current.app = firebase.initializeApp(config);
      fbRef.current.auth = firebase.auth();
      fbRef.current.db = firebase.firestore();
      try {
        fbRef.current.db.settings({ ignoreUndefinedProperties: true });
      } catch {}
      try {
        await fbRef.current.auth.setPersistence(
          window.firebase.auth.Auth.Persistence.LOCAL
        );
      } catch {}
      try {
        await fbRef.current.db.enablePersistence({ synchronizeTabs: true });
      } catch {}
    }

    setCloud((c) => ({ ...c, configured: true }));
    return fbRef.current;
  }

  function saveFirebaseConfig(json) {
    try {
      const cfg = JSON.parse(json);
      localStorage.setItem(STORAGE.fbConfig, JSON.stringify(cfg));
      setCloud((c) => ({ ...c, configured: true }));
      alert("Firebase 설정 저장됨. 이제 로그인하세요.");
    } catch {
      alert("JSON 형식이 올바르지 않습니다.");
    }
  }

  async function signInGoogle() {
    const { auth } = await ensureFirebase();
    const provider = new window.firebase.auth.GoogleAuthProvider();
    try {
      await auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
    } catch {}
    await auth.signInWithRedirect(provider);
  }

  async function signInEmailPassword(email, password) {
    if (!email || !password) return alert("이메일과 비밀번호를 입력하세요.");
    try {
      const { auth } = await ensureFirebase();
      try {
        await auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
      } catch {}
      await auth.signInWithEmailAndPassword(email.trim(), password);
      setLoginOpen(false);
    } catch (e) {
      console.error("email sign-in failed", e);
      alert("로그인 실패: 이메일/비밀번호 또는 Firebase 로그인 설정을 확인하세요.");
    }
  }

  async function signUpEmailPassword(email, password) {
    if (!email || !password) return alert("이메일과 비밀번호를 입력하세요.");
    if (password.length < 6) return alert("비밀번호는 6자 이상이어야 합니다.");
    try {
      const { auth } = await ensureFirebase();
      try {
        await auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
      } catch {}
      await auth.createUserWithEmailAndPassword(email.trim(), password);
      setLoginOpen(false);
    } catch (e) {
      console.error("email sign-up failed", e);
      alert("회원가입 실패: 이미 가입된 이메일이거나 Firebase Email/Password 로그인이 꺼져 있을 수 있습니다.");
    }
  }

  async function resetEmailPassword(email) {
    if (!email) return alert("비밀번호를 재설정할 이메일을 입력하세요.");
    try {
      const { auth } = await ensureFirebase();
      await auth.sendPasswordResetEmail(email.trim());
      alert("비밀번호 재설정 메일을 보냈습니다.");
    } catch (e) {
      console.error("password reset failed", e);
      alert("비밀번호 재설정 메일 발송에 실패했습니다.");
    }
  }
  async function signOut() {
    try {
      const { auth } = await ensureFirebase();
      await auth.signOut();
    } finally {
      setCloud((c) => ({
        ...c,
        enabled: true,
        liveSync: true,
        online: false,
        user: null,
        deckId: "",
        deckTitle: "",
        library: [],
        syncStatus: "로그아웃됨",
      }));
    }
  }
  useEffect(() => {
    (async () => {
      try {
        const { auth } = await ensureFirebase();
        const res = await auth.getRedirectResult();
        if (res && res.user)
          setCloud((c) => ({ ...c, user: res.user, online: true }));
      } catch {}
    })();
  }, []);
  useEffect(() => {
    let unsub;
    (async () => {
      try {
        const { auth } = await ensureFirebase();
        unsub = auth.onAuthStateChanged((u) =>
          setCloud((c) => ({ ...c, user: u || null, online: !!u }))
        );
      } catch {}
    })();
    return () => unsub && unsub();
  }, []);
  useEffect(() => {
    completeEmailLinkIfNeeded();
  }, []);

  function safeJsonValue(value, fallback) {
    try {
      return JSON.parse(JSON.stringify(value ?? fallback));
    } catch {
      return fallback;
    }
  }

  function getUserAppStateDoc(db, uid) {
    return db
      .collection("users")
      .doc(uid)
      .collection("appState")
      .doc("main");
  }

  function buildCloudAppStatePayload() {
    return safeJsonValue(
      {
        version: "v28.1.3",
        words,
        settings,
        theme,
        updatedAt: Date.now(),
      },
      { version: "v28.1.3", words: [], settings: DEFAULT_SETTINGS, theme: DEFAULT_THEME, updatedAt: Date.now() }
    );
  }

  const syncApplyingRemoteRef = useRef(false);
  const syncSaveTimerRef = useRef(null);
  const syncLastUploadedRef = useRef("");
  const syncStartedForUidRef = useRef("");

  function applyRemoteAppState(data) {
    if (!data) return;
    syncApplyingRemoteRef.current = true;
    try {
      if (Array.isArray(data.words)) {
        setWords(
          data.words.map((w) => ({
            folder: DEFAULT_FOLDER,
            mark: null,
            ruAudio: "",
            audioKey: "",
            audioMime: "",
            ...w,
            folder: w.folder || DEFAULT_FOLDER,
            mark: w.mark || null,
            ruAudio: w.ruAudio || "",
            audioKey: w.audioKey || "",
            audioMime: w.audioMime || "",
            mp3Source: w.mp3Source || "",
          }))
        );
      }
      if (data.settings) setSettings((s) => ({ ...s, ...data.settings }));
      if (data.theme) setTheme((t) => ({ ...t, ...data.theme }));
    } finally {
      setTimeout(() => {
        syncApplyingRemoteRef.current = false;
      }, 400);
    }
  }

  async function cloudSaveAppState({ silent = false } = {}) {
    const c = cloudRef.current;
    if (!c?.user) {
      if (!silent) alert("로그인이 필요합니다.");
      return false;
    }
    try {
      const { db } = await ensureFirebase();
      const payload = buildCloudAppStatePayload();
      await getUserAppStateDoc(db, c.user.uid).set(payload, { merge: true });
      syncLastUploadedRef.current = JSON.stringify(payload);
      setCloud((prev) => ({
        ...prev,
        enabled: true,
        liveSync: true,
        syncStatus: `동기화 완료 ${new Date(payload.updatedAt).toLocaleTimeString()}`,
      }));
      if (!silent) alert("클라우드에 저장했습니다.");
      return true;
    } catch (e) {
      console.error("cloudSaveAppState failed", e);
      setCloud((prev) => ({ ...prev, syncStatus: "동기화 저장 실패" }));
      if (!silent) alert("클라우드 저장 실패: Firebase 권한/네트워크를 확인하세요.");
      return false;
    }
  }

  async function cloudLoadAppState({ silent = false } = {}) {
    const c = cloudRef.current;
    if (!c?.user) {
      if (!silent) alert("로그인이 필요합니다.");
      return false;
    }
    try {
      const { db } = await ensureFirebase();
      const snap = await getUserAppStateDoc(db, c.user.uid).get();
      if (!snap.exists) {
        setCloud((prev) => ({ ...prev, syncStatus: "클라우드 데이터 없음" }));
        if (!silent) alert("클라우드 데이터가 없습니다. 현재 기기 데이터를 먼저 저장합니다.");
        await cloudSaveAppState({ silent: true });
        return false;
      }
      const data = snap.data() || {};
      applyRemoteAppState(data);
      const when = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : "";
      setCloud((prev) => ({
        ...prev,
        enabled: true,
        liveSync: true,
        syncStatus: "클라우드 불러오기 완료" + (when ? ` ${when}` : ""),
      }));
      if (!silent) alert("클라우드에서 불러왔습니다.");
      return true;
    } catch (e) {
      console.error("cloudLoadAppState failed", e);
      setCloud((prev) => ({ ...prev, syncStatus: "클라우드 불러오기 실패" }));
      if (!silent) alert("클라우드 불러오기 실패: Firebase 권한/네트워크를 확인하세요.");
      return false;
    }
  }

  useEffect(() => {
    const uidNow = cloud?.user?.uid || "";
    if (!uidNow) {
      syncStartedForUidRef.current = "";
      return;
    }

    let unsub = null;
    let cancelled = false;

    (async () => {
      try {
        const { db } = await ensureFirebase();
        const ref = getUserAppStateDoc(db, uidNow);
        setCloud((prev) => ({ ...prev, enabled: true, liveSync: true, syncStatus: "실시간 동기화 연결 중..." }));

        const firstSnap = await ref.get();
        if (cancelled) return;

        if (firstSnap.exists) {
          applyRemoteAppState(firstSnap.data() || {});
          setCloud((prev) => ({ ...prev, syncStatus: "실시간 동기화 연결됨" }));
        } else {
          await ref.set(buildCloudAppStatePayload(), { merge: true });
          setCloud((prev) => ({ ...prev, syncStatus: "현재 기기 데이터로 클라우드 시작" }));
        }

        syncStartedForUidRef.current = uidNow;
        unsub = ref.onSnapshot((snap) => {
          if (!snap.exists) return;
          const data = snap.data() || {};
          const incoming = JSON.stringify(safeJsonValue({ words: data.words || [], settings: data.settings || {}, theme: data.theme || {} }, {}));
          const current = JSON.stringify(safeJsonValue({ words, settings, theme }, {}));
          if (incoming === current) return;
          applyRemoteAppState(data);
          setCloud((prev) => ({
            ...prev,
            syncStatus: data.updatedAt
              ? `다른 기기 변경 반영 ${new Date(data.updatedAt).toLocaleTimeString()}`
              : "다른 기기 변경 반영",
          }));
        });
      } catch (e) {
        console.error("realtime sync subscribe failed", e);
        setCloud((prev) => ({ ...prev, syncStatus: "실시간 동기화 연결 실패" }));
      }
    })();

    return () => {
      cancelled = true;
      if (typeof unsub === "function") unsub();
    };
  }, [cloud?.user?.uid]);

  useEffect(() => {
    const c = cloudRef.current;
    if (!c?.user?.uid || c.liveSync === false) return;
    if (syncApplyingRemoteRef.current) return;
    if (syncStartedForUidRef.current !== c.user.uid) return;

    const payload = buildCloudAppStatePayload();
    const payloadJson = JSON.stringify(payload);
    if (payloadJson === syncLastUploadedRef.current) return;

    if (syncSaveTimerRef.current) clearTimeout(syncSaveTimerRef.current);
    syncSaveTimerRef.current = setTimeout(async () => {
      try {
        const { db } = await ensureFirebase();
        await getUserAppStateDoc(db, c.user.uid).set(payload, { merge: true });
        syncLastUploadedRef.current = payloadJson;
        setCloud((prev) => ({
          ...prev,
          enabled: true,
          liveSync: true,
          syncStatus: `자동 동기화 ${new Date(payload.updatedAt).toLocaleTimeString()}`,
        }));
      } catch (e) {
        console.error("auto sync save failed", e);
        setCloud((prev) => ({ ...prev, syncStatus: "자동 동기화 실패" }));
      }
    }, 900);

    return () => {
      if (syncSaveTimerRef.current) clearTimeout(syncSaveTimerRef.current);
    };
  }, [words, settings, theme, cloud?.user?.uid, cloud?.liveSync]);

  async function loadLibrary() {
    try {
      const { db } = await ensureFirebase();
      if (!cloudRef.current.user) return;
      const ref = db
        .collection("users")
        .doc(cloudRef.current.user.uid)
        .collection("library");
      const snap = await ref.get();
      const items = snap.docs.map((d) => ({ deckId: d.id, ...d.data() }));
      setCloud((c) => ({ ...c, library: items }));
    } catch {}
  }
  async function createDeck(title) {
    const { db } = await ensureFirebase();
    if (!cloudRef.current.user) return alert("로그인 필요");
    const deckRef = await db.collection("decks").add({
      title,
      ownerUid: cloudRef.current.user.uid,
      createdAt: now(),
      updatedAt: now(),
    });
    const deckId = deckRef.id;
    await db
      .collection("users")
      .doc(cloudRef.current.user.uid)
      .collection("library")
      .doc(deckId)
      .set({ title, role: "owner" });
    setCloud((c) => ({ ...c, deckId, deckTitle: title }));
    alert("덱 생성 완료");
  }
  async function pushLocalToDeck(replace = false) {
    const { db } = await ensureFirebase();
    const c = cloudRef.current;
    if (!c.user || !c.deckId) return alert("덱을 먼저 선택하세요.");
    const batch = db.batch();
    const wordsCol = db.collection("decks").doc(c.deckId).collection("words");
    if (replace) {
      const snap = await wordsCol.get();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
    }
    words.forEach((w) => {
      const ref = wordsCol.doc(w.id);
      batch.set(ref, {
        ru: w.ru,
        ko: w.ko,
        ipa: w.ipa || "",
        img: w.img || "",
        audioUrl: w.audioUrl || "", // ✅ 추가
        audioMime: w.audioMime || "", // ✅ 선택
        folder: w.folder || DEFAULT_FOLDER,
        ruAudio: w.ruAudio || "",
        created: w.created || now(),
      });
    });
    await batch.commit();
    await db.collection("decks").doc(c.deckId).update({ updatedAt: now() });
    alert("로컬 단어를 덱으로 업로드했습니다.");
  }
  async function pullDeckToLocal(merge = true) {
    const { db } = await ensureFirebase();
    const c = cloudRef.current;
    if (!c.deckId) return alert("덱을 먼저 선택");
    const snap = await db
      .collection("decks")
      .doc(c.deckId)
      .collection("words")
      .get();
    const arr = snap.docs.map((d) => {
      const base = d.data() || {};
      return {
        id: d.id,
        ...base,
        audioUrl: base.audioUrl || "", // ✅ 추가(선택)
        audioMime: base.audioMime || "", // ✅ 추가(선택)
        mark: null,
        seen: false,
        reps: 0,
        interval: 0,
        ef: 2.5,
        due: 0,
      };
    });
    if (merge) {
      const key = (x) => `${x.id}`;
      const existing = new Set(words.map((w) => key(w)));
      const toAdd = arr.filter((v) => !existing.has(key(v)));
      if (toAdd.length) setWords((w) => [...toAdd, ...w]);
    } else {
      setWords(arr);
    }
    alert("덱에서 로컬로 불러왔습니다.");
  }
  async function loadDeckJoinToLocal() {
    const { db } = await ensureFirebase();
    const c = cloudRef.current;
    if (!c.user || !c.deckId) return;
    const [wSnap, pSnap] = await Promise.all([
      db.collection("decks").doc(c.deckId).collection("words").get(),
      db
        .collection("users")
        .doc(c.user.uid)
        .collection("progress")
        .doc(c.deckId)
        .collection("words")
        .get(),
    ]);
    const progress = new Map();
    pSnap.docs.forEach((d) => progress.set(d.id, d.data()));
    const arr = wSnap.docs.map((d) => {
      const base = d.data();
      const pr = progress.get(d.id) || {};
      return {
        id: d.id,
        ru: base.ru,
        ko: base.ko,
        ipa: base.ipa || "",
        img: base.img || "",
        audioUrl: base.audioUrl || "", // ✅ 여기 추가
        audioMime: base.audioMime || "", // ✅ (선택) mp3/ogg 같은 타입 저장용
        folder: base.folder || DEFAULT_FOLDER,
        created: base.created || now(),
        seen: !!pr.seen,
        reps: pr.reps || 0,
        interval: pr.interval || 0,
        ef: pr.ef || 2.5,
        due: pr.due || 0,
        last: pr.last || 0,
        mark: pr.mark || null,
      };
    });
    setWords(arr);
  }
  async function saveProgressCloud(wordId, pr) {
    try {
      const c = cloudRef.current;
      if (!c.enabled || !c.user || !c.deckId) return;
      const { db } = await ensureFirebase();
      const ref = db
        .collection("users")
        .doc(c.user.uid)
        .collection("progress")
        .doc(c.deckId)
        .collection("words")
        .doc(wordId);
      await ref.set(pr, { merge: true });
    } catch {}
  }
  function shareLink() {
    const c = cloudRef.current;
    if (!c.deckId) return alert("덱을 먼저 선택");
    const url = `${location.origin}${location.pathname}?deck=${c.deckId}`;
    navigator.clipboard?.writeText(url);
    alert("링크를 복사했어요!\n" + url);
  }
  async function sendEmailLinkLogin(email) {
    if (!email || !/\S+@\S+\.\S+/.test(email))
      return alert("올바른 이메일을 입력하세요.");
    const { auth } = await ensureFirebase();
    const actionCodeSettings = {
      url: location.origin + location.pathname,
      handleCodeInApp: true,
    };
    await auth.sendSignInLinkToEmail(email, actionCodeSettings);
    localStorage.setItem("rusdrops_email_for_signin", email);
    alert(
      "로그인 링크를 이메일로 보냈어요. 메일에서 링크를 눌러 돌아오면 자동 로그인됩니다."
    );
  }
  async function completeEmailLinkIfNeeded() {
    try {
      const { auth } = await ensureFirebase();
      if (auth.isSignInWithEmailLink(window.location.href)) {
        let email = localStorage.getItem("rusdrops_email_for_signin");
        if (!email) email = prompt("로그인에 사용한 이메일을 입력하세요:");
        const res = await auth.signInWithEmailLink(email, window.location.href);
        localStorage.removeItem("rusdrops_email_for_signin");
        setCloud((c) => ({ ...c, user: res.user, online: true }));
        history.replaceState({}, "", location.origin + location.pathname);
      }
    } catch (e) {
      console.warn("email-link complete error:", e);
      alert("이메일 링크 로그인 처리 중 문제가 발생했습니다.");
    }
  }
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const d = p.get("deck");
    if (d) setCloud((c) => ({ ...c, deckId: c.deckId || d }));
  }, []);

  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsArrayBuffer(file);
    });
  }

  // ===== Export / Import (헤더 액션용) =====
  function downloadJSON(filename, dataObj) {
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  function exportJson() {
    const payload = {
      app: "RusDrops",
      version: "1.6",
      exportedAt: new Date().toISOString(),
      words,
      settings,
      theme,
    };
    downloadJSON("rusdrops-backup-v1.6.json", payload);
  }
  function exportVocabOnly() {
    const vocab = words.map(({ ru, ko, ipa, img, folder }) => ({
      ru,
      ko,
      ipa: ipa || "",
      img: img || "",
      folder: folder || DEFAULT_FOLDER,
    }));
    downloadJSON("rusdrops-vocab-v1.6.json", {
      app: "RusDrops",
      version: "1.6",
      vocab,
    });
  }

  // ===== Export / Import (with Audio Blob) =====
  async function exportJsonWithAudio() {
    const wordsWithAudio = [];

    for (const w of words) {
      let audio = null;

      if (w.audioKey) {
        const rec = await idbGetAudio(w.audioKey);
        if (rec?.blob) {
          const base64 = await blobToBase64(rec.blob);
          if (base64) {
            audio = {
              key: w.audioKey,
              mime: rec.mime || "audio/mpeg",
              base64,
            };
          }
        }
      }

      wordsWithAudio.push({
        ...w,
        audio, // { key, mime, base64 } | null
      });
    }

    const payload = {
      app: "RusDrops",
      version: "1.6-audio",
      exportedAt: new Date().toISOString(),
      settings,
      theme,
      words: wordsWithAudio,
    };

    downloadJSON("rusdrops-backup-with-audio.json", payload);
  }

  async function importJsonWithAudio(file) {
    const fr = new FileReader();

    fr.onload = async () => {
      try {
        const data = JSON.parse(fr.result);
        if (!Array.isArray(data.words)) {
          throw new Error("words 배열 없음");
        }

        const restored = [];

        for (const w of data.words) {
          let audioKey = w.audioKey || "";

          // 🔊 오디오 복구
          if (w.audio?.base64) {
            const blob = base64ToBlob(
              w.audio.base64,
              w.audio.mime || "audio/mpeg"
            );

            if (blob) {
              audioKey = w.audio.key || w.audioKey || "a_" + (w.id || uid());

              await idbPutAudio({
                key: audioKey,
                blob,
                mime: w.audio.mime || blob.type || "audio/mpeg",
                updatedAt: Date.now(),
              });
            }
          }

          restored.push({
            id: w.id || uid(),
            ru: w.ru,
            ko: w.ko,
            ipa: w.ipa || "",
            img: w.img || "",
            folder: w.folder || DEFAULT_FOLDER,
            mark: w.mark || null,
            created: w.created || now(),
            seen: !!w.seen,
            reps: w.reps || 0,
            interval: w.interval || 0,
            ef: w.ef || 2.5,
            due: w.due || 0,
            last: w.last || 0,

            // 🔑 오디오 관련 필드
            audioKey,
            audioMime: w.audioMime || w.audio?.mime || "",

            // 🔁 URL 스트리밍 필드도 유지
            ruAudio: w.ruAudio || "",
          });
        }

        setWords(restored);
        if (data.settings) setSettings((s) => ({ ...s, ...data.settings }));
        if (data.theme) setTheme((t) => ({ ...t, ...data.theme }));

        alert("오디오 포함 백업을 불러왔습니다.");
      } catch (e) {
        console.error(e);
        alert("오디오 백업 가져오기 실패: JSON 형식 확인");
      }
    };

    fr.readAsText(file);
  }

  async function exportZipWithAudio({ words }) {
    const zip = new JSZip();

    // 1) 기존 백업 JSON(단어/설정)을 data.json으로 저장
    const payload = {
      exportedAt: Date.now(),
      version: "zip-audio-1",
      words,
    };
    zip.file("data.json", JSON.stringify(payload, null, 2));

    // 2) 오디오(IndexedDB)도 같이 담기
    const audioFolder = zip.folder("audio");

    for (const w of words) {
      const key = w.audioKey;
      if (!key) continue;

      // ✅ 너 프로젝트에 이미 있는 함수들: idbGetAudio / idbPutAudio 구조에 맞춰서
      const rec = await idbGetAudio(key);
      // rec 예상: { key, blob, mime, updatedAt }

      if (!rec?.blob) continue;

      // 파일명은 key로 고정 (기기 간 호환되도록)
      const mimeGuess = (rec.mime || w.audioMime || "").toLowerCase();

      // mp3는 보통 audio/mpeg
      const isMp3 =
        mimeGuess.includes("audio/mpeg") ||
        mimeGuess.includes("mpeg") ||
        mimeGuess.includes("mp3");

      const ext = isMp3 ? "mp3" : "bin";

      // ✅ Blob 타입을 강제로 audio/mpeg로 맞춰 ZIP에 넣기
      let audioBlob = rec.blob;

      // ArrayBuffer/Uint8Array 같은 형태면 Blob으로 감싸기
      if (audioBlob && !(audioBlob instanceof Blob)) {
        audioBlob = new Blob([audioBlob], {
          type: isMp3 ? "audio/mpeg" : "application/octet-stream",
        });
      } else if (audioBlob instanceof Blob) {
        const t = (audioBlob.type || "").toLowerCase();
        // type이 비어있거나 octet-stream이면 mp3로 강제(특히 iOS/일부 브라우저 대비)
        if (isMp3 && (!t || t.includes("octet-stream"))) {
          audioBlob = new Blob([audioBlob], { type: "audio/mpeg" });
        }
      }

      audioFolder.file(`${key}.${ext}`, audioBlob);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(`rusdrops-audio-backup-${Date.now()}.zip`, blob);
  }
  async function importZipWithAudio(file, { setWords }) {
    const buf = await readFileAsArrayBuffer(file);
    const zip = await JSZip.loadAsync(buf);

    // 1) data.json 읽어서 words 복구
    const dataText = await zip.file("data.json").async("text");
    const data = JSON.parse(dataText);

    const incomingWords = data.words || [];
    setWords((prev) => mergeWordsPreserveProgress(prev, incomingWords));

    // 2) audio 폴더 안 파일들을 전부 IDB에 저장(덮어쓰기)
    const audioFiles = Object.keys(zip.files).filter(
      (p) => p.startsWith("audio/") && !zip.files[p].dir
    );

    // mp3 헤더 감지 (ID3 또는 MPEG frame sync)
    function looksLikeMp3(u8) {
      if (!u8 || u8.length < 2) return false;

      // "ID3"
      if (
        u8.length >= 3 &&
        u8[0] === 0x49 && // I
        u8[1] === 0x44 && // D
        u8[2] === 0x33 // 3
      )
        return true;

      // MPEG frame sync: 0xFF Ex (상위 3비트 111)
      if (u8[0] === 0xff && (u8[1] & 0xe0) === 0xe0) return true;

      return false;
    }

    for (const path of audioFiles) {
      const fileObj = zip.file(path);
      if (!fileObj) continue;

      // ✅ blob로 바로 만들지 말고 arraybuffer로 읽어서 "진짜 mp3인지" 판단
      const ab = await fileObj.async("arraybuffer");
      const u8 = new Uint8Array(ab);

      const filename = path.split("/").pop() || "";
      const lower = filename.toLowerCase();

      const isMp3ByName = lower.endsWith(".mp3");
      const isBinByName = lower.endsWith(".bin");
      const isMp3ByMagic = looksLikeMp3(u8);

      // ✅ 핵심: .bin이어도 mp3 헤더면 mp3로 복원 저장
      const finalIsMp3 = isMp3ByName || (isBinByName && isMp3ByMagic);

      const key = filename.replace(/\.(mp3|bin)$/i, "");

      const mime = finalIsMp3 ? "audio/mpeg" : "application/octet-stream";
      const blob = new Blob([u8], { type: mime });

      // iOS 덮어쓰기 이슈 방지
      const existing = await idbGetAudio(key);
      if (existing?.blob) continue; // ✅ 이미 있으면 스킵

      await idbPutAudio({ key, blob, mime, updatedAt: Date.now() });
    }

    alert("ZIP 복구 완료 (오디오 포함)");
  }

  function importJson(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const data = JSON.parse(fr.result);
        if (Array.isArray(data.words)) {
          const mapped = data.words.map((w) => ({
            id: w.id || uid(),
            ru: w.ru,
            ko: w.ko,
            ipa: w.ipa || "",
            img: w.img || "",
            folder: w.folder || DEFAULT_FOLDER,
            mark: w.mark || null,

            // ✅ 오디오 복구 핵심 (백업에 있던 값 그대로 살림)
            ruAudio: (w.ruAudio || "").trim(),
            audioUrl: (w.audioUrl || "").trim(), // (만약 쓰고 있다면)
            audioMime: (w.audioMime || "").trim(), // (만약 쓰고 있다면)

            created: w.created || now(),
            seen: !!w.seen,
            reps: w.reps || 0,
            interval: w.interval || 0,
            ef: w.ef || 2.5,
            due: w.due || 0,
            last: w.last || 0,
            playN: Number.isFinite(w.playN) ? w.playN : 1,
          }));
          setWords(mapped);
        }
        if (data.settings) setSettings((s) => ({ ...s, ...data.settings }));
        if (data.theme) setTheme((t) => ({ ...t, ...data.theme }));
        alert("백업을 불러왔습니다.");
      } catch {
        alert("가져오기 실패: JSON 형식을 확인하세요.");
      }
    };
    fr.readAsText(file);
  }
  function importVocabOnly(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const data = JSON.parse(fr.result);
        const list =
          (Array.isArray(data) && data) || data.vocab || data.words || [];
        if (!Array.isArray(list)) throw new Error("vocab 배열을 찾을 수 없음");
        const key = (x) =>
          `${(x.ru || "").trim().toLowerCase()}|${(x.ko || "")
            .trim()
            .toLowerCase()}`;
        setWords((prev) => {
          const map = new Map(prev.map((w) => [key(w), w]));
          let added = 0,
            updated = 0;
          list.forEach((raw) => {
            const rec = {
              ru: raw.ru,
              ko: raw.ko,
              ipa: raw.ipa || "",
              img: raw.img || "",
              folder: raw.folder || DEFAULT_FOLDER,
            };
            if (!rec.ru || !rec.ko) return;
            const k = key(rec);
            if (!map.has(k)) {
              map.set(k, {
                id: uid(),
                ...rec,
                mark: null,
                playN: 1,
                created: now(),
                seen: false,
                reps: 0,
                interval: 0,
                ef: 2.5,
                due: 0,
                last: 0,
              });
              added++;
            } else {
              const old = map.get(k);
              const merged = {
                ...old,
                ipa: old.ipa || rec.ipa,
                img: old.img || rec.img,
                folder: old.folder || rec.folder || DEFAULT_FOLDER,
              };
              // 변경 여부 체크(필드 단위)
              const changed =
                old.ipa !== merged.ipa ||
                old.img !== merged.img ||
                old.folder !== merged.folder;
              if (changed) updated++;
              map.set(k, merged);
            }
          });
          alert(`어휘 병합 완료: 추가 ${added} · 보강 ${updated}`);
          return Array.from(map.values());
        });
      } catch {
        alert("어휘 병합 실패: JSON 형식을 확인하세요.");
      }
    };
    fr.readAsText(file);
  }
  const startRecording = async () => {
    try {
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("녹음 시작 실패:", err);
      alert("녹음 시작에 실패했습니다. 브라우저 권한/장치를 확인해주세요.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    // ✅ onstop을 stop() 전에 먼저 걸어야 안정적
    recorder.onstop = async () => {
      try {
        const chunks = chunksRef.current || [];
        chunksRef.current = [];

        // 🔻 녹음 끝나면 마이크 스트림 끄기(안 끄면 다음이 꼬일 수 있음)
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        if (!chunks.length) {
          alert("녹음 데이터가 없습니다. 입력 장치 설정을 확인해주세요.");
          return;
        }

        const mime =
          recorder.mimeType ||
          (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "");

        const blob = new Blob(chunks, mime ? { type: mime } : undefined);

        if (!editId) return;

        if (w?.audioKey) {
          try {
            await idbDeleteAudio(w.audioKey);
          } catch {}
        }

        const key = `a_${editId}_${Date.now()}`;
        await idbPutAudio({
          key,
          blob,
          mime: blob.type || mime || "audio/webm",
          updatedAt: Date.now(),
        });

        onUpdate(editId, {
          audioKey: key,
          audioMime: blob.type || mime || "audio/webm",
          mp3Source: "record", // ✅ 빨간 문구용
        });
      } catch (err) {
        console.error("녹음 저장 실패:", err);
        alert("녹음 저장 중 오류가 발생했습니다.");
      } finally {
        setIsRecording(false); // ✅ 에러나도 무조건 버튼 복구
      }
    };

    try {
      recorder.stop();
    } catch (e) {
      console.error("recorder.stop 실패:", e);
      setIsRecording(false);
    }
  };

  // ===== Bulk Import Handler (shared) =====
  const handleBulkImport = async (txt, targetFolder) => {
    const rows = txt
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    // 0) 파싱 -> 작업 큐 만들기 (기존 파서 사용: CSV/TSV 안전)
    const tasks = [];
    let parsedCount = 0;

    rows.forEach((line) => {
      const parts = parseCSVorTSV(line);

      // RU만 있어도 허용
      if (parts.length >= 1) {
        const [
          ru,
          ko = "",
          ipa = "",
          img = "",
          folderCol = DEFAULT_FOLDER,
          ruAudio = "",
        ] = parts;

        const ruClean = (ru || "").trim();
        if (!ruClean) return;

        const folder =
          (targetFolder || folderCol || DEFAULT_FOLDER).trim() ||
          DEFAULT_FOLDER;

        tasks.push({
          ru: ruClean,
          ko: (ko || "").trim(), // 비어있으면 번역 대상
          ipa: (ipa || "").trim(),
          img: (img || "").trim(),
          folder,
          ruAudio: (ruAudio || "").trim(),
        });
        parsedCount++;
      }
    });

    if (!tasks.length) return;

    // 1) 번역/가공 (동시성 제한: 3 권장)
    // - 공용 번역이면 2~3이 안전
    // - 키 기반 번역이면 5~8도 가능
    const total = tasks.length;

    // ✅ 자동 조절
    const CONCURRENCY = total >= 250 ? 1 : total >= 100 ? 2 : 3;

    let translatedCount = 0;
    let failedTranslateCount = 0;

    const built = await mapLimit(tasks, CONCURRENCY, async (t) => {
      // 1) KO 확보
      let koFinal = t.ko;
      if (!koFinal) {
        koFinal = await translateRuToKoCached(t.ru);
        if (koFinal) translatedCount++;
        else failedTranslateCount++;
      }

      // 2) RU 오디오 URL 무효 처리(기존 안전장치 유지)
      const ruAudioFinal = (() => {
        const u = (t.ruAudio || "").trim();
        if (/^blob:/i.test(u)) return "";
        if (/^file:\/\//i.test(u)) return "";
        if (/^[A-Za-z]:\\/.test(u)) return "";
        return u;
      })();

      // 3) emoji 자동 (KO 기반)
      const emojiFinal = autoPickEmoji(normalizeKoForEmoji(koFinal));

      return {
        id: uid(),
        ru: t.ru,
        ko: koFinal,
        emoji: emojiFinal,
        ipa: t.ipa,
        img: t.img,
        folder: t.folder,
        ruAudio: ruAudioFinal,
        mark: null,
        created: now(),
        seen: false,
        reps: 0,
        interval: 0,
        ef: 2.5,
        due: 0,
      };
    });

    // 2) 저장(순서 유지) + 안내
    setWords((w) => [...w, ...built]);

    const msg =
      `${built.length}개 단어를 추가했습니다.` +
      (translatedCount ? ` (자동 번역 ${translatedCount}개)` : "") +
      (failedTranslateCount
        ? ` (번역 실패 ${failedTranslateCount}개: KO가 비어있을 수 있어요)`
        : "");

    alert(msg);
  };

  // ===== Render =====
  return (
    <div
      className="rd"
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* 헤더 */}
      <div className="header-bar header-bar-v2" style={{ width: "100%" }}>
        <div className="header-left">
          <div className="app-title">🥭 Daily Voca 🍒</div>
        </div>

        <div className="header-right">
          <div className="header-actions">
            <button
              className={cloud.user ? "btnMini authTopBtn loggedIn" : "btnMini authTopBtn"}
              onClick={() => setLoginOpen(true)}
              title={cloud.user ? `로그인됨: ${cloud.user.email || cloud.user.displayName || cloud.user.uid}` : "로그인"}
            >
              {cloud.user ? "✅ 계정" : "로그인"}
            </button>

            <button
              className="btnMini"
              onClick={() => exportZipWithAudio({ words })}
              title="백업(zip)"
            >
              ☁️ 백업
            </button>

            <input
              id="zipRestoreInput"
              type="file"
              accept=".zip,application/zip"
              style={{ display: "none" }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                await importZipWithAudio(f, { setWords });
                e.target.value = "";
              }}
            />

            <button
              className="btnMini"
              onClick={() =>
                document.getElementById("zipRestoreInput")?.click()
              }
              title="복구(zip)"
            >
              ⬇️ 복구
            </button>

            <button
              className="btnMini btnMiniIcon"
              onClick={() => setAppSettingsOpen(true)}
              title="설정"
              aria-label="settings"
            >
              🔧
            </button>
          </div>
        </div>
      </div>

      {/* 로그인 팝업 */}
      {loginOpen && (
        <div className="authModalOverlay" onClick={() => setLoginOpen(false)}>
          <div className="authModal" onClick={(e) => e.stopPropagation()}>
            <div className="authModalTop">
              <div>
                <div className="authModalTitle">계정 로그인</div>
                <div className="authModalSub">
                  {cloud.user
                    ? `${cloud.user.email || cloud.user.displayName || cloud.user.uid} 로그인 중`
                    : "로그인하면 단어장과 설정이 기기 간 실시간 동기화됩니다."}
                </div>
              </div>
              <button className="bpModalClose" onClick={() => setLoginOpen(false)}>✕</button>
            </div>

            {!cloud.user && (
              <>
                <div className="authFields">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="이메일"
                    autoComplete="email"
                  />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="비밀번호"
                    autoComplete="current-password"
                  />
                </div>
                <div className="authActions">
                  <button className="pill primary" onClick={() => signInEmailPassword(loginEmail, loginPassword)}>
                    이메일 로그인
                  </button>
                  <button className="pill" onClick={() => signUpEmailPassword(loginEmail, loginPassword)}>
                    회원가입
                  </button>
                  <button className="pill" onClick={signInGoogle}>
                    Google 로그인
                  </button>
                  <button className="pill" onClick={() => resetEmailPassword(loginEmail)}>
                    비밀번호 재설정
                  </button>
                </div>
              </>
            )}

            {cloud.user && (
              <div className="authSignedBox">
                <div className="syncStatusText">동기화 상태: {cloud.syncStatus || "연결됨"}</div>
                <label className="syncToggleLine">
                  <input
                    type="checkbox"
                    checked={cloud.liveSync !== false}
                    onChange={(e) => setCloud((c) => ({ ...c, liveSync: e.target.checked }))}
                  />
                  실시간 자동 동기화 사용
                </label>
                <div className="authActions">
                  <button className="pill" onClick={() => cloudSaveAppState()}>
                    지금 저장
                  </button>
                  <button className="pill" onClick={() => cloudLoadAppState()}>
                    지금 불러오기
                  </button>
                  <button className="pill danger" onClick={signOut}>
                    로그아웃
                  </button>
                </div>
              </div>
            )}

            <div className="authHelp">
              로그인 유지 방식은 LOCAL입니다. 같은 기기/브라우저에서는 다시 열어도 로그인 상태가 유지됩니다.
            </div>
          </div>
        </div>
      )}

      {/* 설정(🔧) 팝업 */}
      {appSettingsOpen && (
        <div
          className="bpModalOverlay"
          onClick={() => setAppSettingsOpen(false)}
        >
          <div className="bpModalSheet" onClick={(e) => e.stopPropagation()}>
            <div className="bpModalHeader">
              <div className="bpModalTitle">설정</div>
              <div className="bpModalVersion">v28.1.3 Realtime Firebase Sync</div>
              <button
                className="bpModalClose"
                onClick={() => setAppSettingsOpen(false)}
                aria-label="close"
              >
                ✕
              </button>
            </div>

            <div className="bpModalBody">
              {/*
                기존 하단 패널(도구/음성/Cloud/테마)을 그대로 이동
                - 기능/상태는 동일하게 유지
              */}
              <Fold title="🧰 도구">
                <ToolsPanel words={words} setWords={setWords} bare />
              </Fold>

              <Fold title="📁 폴더 기본 재생값">
                <div
                  className="bpRow bpRowTriple"
                  style={{ gap: 10, flexWrap: "wrap" }}
                >
                  <div className="bpField">
                    <div className="bpFieldLabel">RU 반복</div>
                    <select
                      className="bpSelect"
                      value={applyAllRU}
                      onChange={(e) => setApplyAllRU(Number(e.target.value))}
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          x{n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bpField">
                    <div className="bpFieldLabel">KO 반복</div>
                    <select
                      className="bpSelect"
                      value={applyAllKO}
                      onChange={(e) => setApplyAllKO(Number(e.target.value))}
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          x{n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bpField">
                    <div className="bpFieldLabel">재생 방향</div>
                    <select
                      className="bpSelect"
                      value={applyAllOrder}
                      onChange={(e) => setApplyAllOrder(e.target.value)}
                    >
                      <option value="KO_RU">KO → RU</option>
                      <option value="RU_KO">RU → KO</option>
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  <button
                    className="btn"
                    onClick={applyDefaultFolderPlayPrefsAll}
                    title="모든 폴더에 위 기본값을 적용"
                  >
                    모든 폴더에 적용
                  </button>
                </div>

                <div
                  style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}
                >
                  현재 설정: RU x{applyAllRU} / KO x{applyAllKO} / 방향:{" "}
                  {applyAllOrder === "KO_RU" ? "KO→RU" : "RU→KO"}
                </div>
              </Fold>
              <Fold title="🎙️ 음성/입력 설정">
                <VoiceSettings
                  settings={settings}
                  setSettings={setSettings}
                  voices={voices}
                />
                <div
                  style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}
                >
                  ※ 받아쓰기/철자 모드에서 <b>영→러 변환</b>을 끄면 키릴 자판
                  또는 아래 키패드로 직접 입력하세요.
                </div>
              </Fold>

              <Fold title="☁️ 계정 동기화">
                <div className="syncInfoBox">
                  <div><b>실시간 동기화는 상단 [로그인]에서 관리합니다.</b></div>
                  <div>로그인 상태에서 단어/설정이 바뀌면 Firebase에 자동 저장되고, 같은 계정의 다른 기기에 반영됩니다.</div>
                  <div className="syncStatusText">상태: {cloud.syncStatus || (cloud.user ? "동기화 대기 중" : "로그인 필요")}</div>
                  <label className="syncToggleLine">
                    <input
                      type="checkbox"
                      checked={cloud.liveSync !== false}
                      onChange={(e) => setCloud((c) => ({ ...c, liveSync: e.target.checked }))}
                    />
                    실시간 자동 동기화 사용
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <button className="pill" onClick={() => cloudSaveAppState()}>지금 클라우드 저장</button>
                    <button className="pill" onClick={() => cloudLoadAppState()}>지금 클라우드 불러오기</button>
                  </div>
                </div>
              </Fold>

              <ThemePanel theme={theme} setTheme={setTheme} />
            </div>
          </div>
        </div>
      )}

      {/* ✅ SRS 학습(세션) 오버레이 */}
      {sessionOn && (
        <div className="srsSessionOverlay" role="dialog" aria-modal="true">
          <div className="srsSessionSheet" onClick={(e) => e.stopPropagation()}>
            <div className="srsSessionTop">
              <div className="srsSessionTopLeft">
                <div className="srsSessionTitle">학습</div>
                <div className="srsSessionCounter">
                  {Math.min(sessionList.length, idx + 1)}/
                  {sessionList.length || 0}
                </div>
              </div>

              <button
                type="button"
                className="srsStopBtn"
                onClick={(e) => {
                  e.stopPropagation();
                  stopSession();
                }}
              >
                학습 중지
              </button>
            </div>

            <div className="srsSessionBody">
              <div className="srsCardWrap">
                <div
                  className={`srsCard ${showBack ? "back" : "front"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (current?.ru) speakRU(current.ru, settings);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    if (current?.ru) speakRU(current.ru, settings);
                  }}
                >
                  <div className="srsThumb">
                    <div className="srsThumbInner">{thumbEmoji || ""}</div>
                  </div>

                  <div
                    className="srsWordRu"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (settings.srsDirection === "RU_KO" && current?.ru) {
                        speakRU(current.ru, settings);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      if (settings.srsDirection === "RU_KO" && current?.ru) {
                        speakRU(current.ru, settings);
                      }
                    }}
                  >
                    {settings.mode === "learn"
                      ? settings.srsDirection === "RU_KO"
                        ? current?.ru
                        : current?.ko
                      : settings.mode === "dict"
                      ? ""
                      : current?.ko}
                  </div>

                  {showBack && (
                    <div
                      className="srsWordKo"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (settings.srsDirection === "KO_RU" && current?.ru) {
                          speakRU(current.ru, settings);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" && e.key !== " ") return;
                        e.preventDefault();
                        if (settings.srsDirection === "KO_RU" && current?.ru) {
                          speakRU(current.ru, settings);
                        }
                      }}
                    >
                      {settings.mode === "learn"
                        ? settings.srsDirection === "RU_KO"
                          ? current?.ko
                          : current?.ru
                        : current?.ru}
                    </div>
                  )}
                </div>

                {/* ✅ extra modes UI */}
                {(settings.mode === "type" || settings.mode === "dict") && (
                  <div className="srsModeBlock">
                    <div className="srsModeHint">
                      {settings.mode === "dict"
                        ? "받아쓰기: 들리는 러시아어를 입력"
                        : "철자: 한국어 뜻을 보고 러시아어 입력"}
                    </div>
                    {settings.mode === "type" && (
                      <div className="srsPromptKo">{current?.ko || ""}</div>
                    )}
                    <div className="srsInputRow">
                      <input
                        className="srsTypeInput"
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        placeholder="러시아어 입력"
                      />
                      <button
                        type="button"
                        className="srsTypeBtn"
                        onClick={() => {
                          const ok =
                            normRuStr(typedAnswer) === normRuStr(current?.ru);
                          setAnswerOk(ok);
                          setShowBack(true);
                        }}
                      >
                        확인
                      </button>
                      <button
                        type="button"
                        className="srsTypeBtn"
                        onClick={() => {
                          if (current?.ru) speakRU(current.ru, settings);
                        }}
                        title="발음"
                      >
                        🔊
                      </button>
                    </div>
                    {showBack && (
                      <div
                        className={`srsResultLine ${answerOk ? "ok" : "no"}`}
                      >
                        {answerOk === null
                          ? ""
                          : answerOk
                          ? "정답!"
                          : "아쉬워요"}
                      </div>
                    )}
                  </div>
                )}

                {settings.mode === "choice" && (
                  <div className="srsModeBlock">
                    <div className="srsModeHint">
                      객관식: 뜻을 보고 러시아어 고르기
                    </div>
                    <div className="srsPromptKo">{current?.ko || ""}</div>
                    {!showBack ? (
                      <div className="srsChoiceGrid">
                        {choiceOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className="srsChoiceBtn"
                            onClick={() => {
                              setPickedOption(opt);
                              const ok =
                                normRuStr(opt) === normRuStr(current?.ru);
                              setAnswerOk(ok);
                              setShowBack(true);
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                        <button
                          type="button"
                          className="srsChoiceBtn"
                          onClick={() => {
                            if (current?.ru) speakRU(current.ru, settings);
                          }}
                          title="발음"
                        >
                          🔊
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`srsResultLine ${answerOk ? "ok" : "no"}`}
                      >
                        {pickedOption ? `선택: ${pickedOption} · ` : ""}
                        {answerOk ? "정답!" : "오답"}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="srsGrades">
                <button
                  type="button"
                  className="srsGradeBtn easy"
                  onClick={(e) => {
                    e.stopPropagation();
                    frontChoice(5);
                  }}
                >
                  쉽당
                </button>

                <button
                  type="button"
                  className="srsGradeBtn mid"
                  onClick={(e) => {
                    e.stopPropagation();
                    frontChoice(3);
                  }}
                >
                  보통
                </button>

                <button
                  type="button"
                  className="srsGradeBtn hard"
                  onClick={(e) => {
                    e.stopPropagation();
                    frontChoice(1);
                  }}
                >
                  어렵당
                </button>

                {/* ✅ 다음 버튼: 답(ko) 표시 후에만 활성 */}
                <button
                  type="button"
                  className={`srsNextBtn ${showBack ? "on" : "off"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!showBack) return;
                    backChoice(); // ✅ pendingGrade로 채점 + 다음 카드
                  }}
                  disabled={!showBack}
                  title={showBack ? "다음" : "먼저 색을 선택하세요"}
                >
                  다음 ▶
                </button>
              </div>

              <div className="srsNav">
                <button
                  type="button"
                  className="srsNavBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevCard();
                  }}
                  aria-label="prev"
                  title="이전"
                >
                  ◀
                </button>

                <div className="srsNavCenter">
                  {Math.min(sessionList.length, idx + 1)}/
                  {sessionList.length || 0}
                </div>

                <button
                  type="button"
                  className="srsNavBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextCard();
                  }}
                  aria-label="next"
                  title="다음"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상단 퀵 액션: Start! + Add words */}
      <div className="topQuickRow">
        <div className="quickStudyCard topActionCard">
          <button
            type="button"
            className="quickStudyBtn"
            onClick={() => startSession()}
            title="Start!"
          >
            <span className="quickStudyLeft">
              🔥 <span className="quickStudyText">Start!</span>
            </span>
          </button>
          <button
            type="button"
            className="quickStudyMoreBtn"
            onClick={(e) => {
              e.stopPropagation();
              setSrsSettingsOpen(true);
            }}
            title="학습 설정"
            aria-label="study settings"
          >
            …
          </button>
        </div>

        <div className="quickStudyCard topActionCard importQuickCard">
          <button
            type="button"
            className="quickStudyBtn"
            onClick={() => setImportOpen(true)}
            title="Add words"
          >
            <span className="quickStudyLeft">
              🔎 <span className="quickStudyText">Add words</span>
            </span>
          </button>
        </div>
      </div>

      {/* 가져오기 입력 모달 */}
      {importOpen && (
        <div
          className="importModalOverlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setImportOpen(false);
          }}
        >
          <div className="importModal" role="dialog" aria-modal="true">
            <div className="importModalTop">
              <div className="importModalTitle">Add words</div>
              <button
                className="btnMini"
                onClick={() => setImportOpen(false)}
                title="닫기"
              >
                ✕
              </button>
            </div>

            <div className="importModalHint">
              한 줄 = 한 단어 (TSV/CSV 지원). 예:
              <code> союз\t연합\t\t🤝\t복습 1강</code>
            </div>

            <div className="importModalFolderRow">
              <span className="importModalLabel">저장 폴더(선택)</span>
              <input
                className="importModalFolderInput"
                value={importFolder}
                onChange={(e) => setImportFolder(e.target.value)}
                list="import-folder-datalist"
                placeholder="비워두면 각 줄의 폴더/기본 폴더 사용"
              />
              <datalist id="import-folder-datalist">
                {[DEFAULT_FOLDER, ...folderOptions].map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>

            <textarea
              className="importModalTextarea"
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={
                'союз,"연합, 동맹, 접속사",,🤝,복습 1강\nдом,집,,🏠,복습 1강'
              }
            />

            <div className="importModalActions">
              <button
                className="btn"
                onClick={async () => {
                  if (!importText.trim()) return;
                  await handleBulkImport(importText, importFolder);
                  setImportText("");
                  setImportOpen(false);
                }}
              >
                가져오기
              </button>
              <button className="btn" onClick={() => setImportOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SRS 학습 설정 모달 */}
      {srsSettingsOpen && (
        <div
          className="srsModalOverlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSrsSettingsOpen(false);
          }}
        >
          <div className="srsModal" role="dialog" aria-modal="true">
            <div className="srsModalTop">
              <div className="srsModalTitle">학습 설정</div>
              <button
                className="btnMini"
                onClick={() => setSrsSettingsOpen(false)}
                title="닫기"
              >
                ✕
              </button>
            </div>

            <div className="srsControls">
              <label className="srsField">
                <span>폴더</span>
                <select
                  value={settings.sessionFolder}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      sessionFolder: e.target.value,
                    }))
                  }
                >
                  {allFolders.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>

              <label className="srsField">
                <span>순서</span>
                <select
                  value={settings.sessionOrder}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, sessionOrder: e.target.value }))
                  }
                >
                  <option value="srs">SRS/기한순</option>
                  <option value="added">추가순</option>
                </select>
              </label>

              <label className="srsField">
                <span>분량</span>
                <NumField
                  value={settings.sessionCount ?? 0}
                  min={0}
                  max={999}
                  width={72}
                  title="0=제한 없음"
                  onCommit={(v) =>
                    setSettings((s) => ({ ...s, sessionCount: Math.max(0, v) }))
                  }
                />
              </label>

              <label className="srsCheck">
                <input
                  type="checkbox"
                  checked={!!settings.redFirst}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, redFirst: e.target.checked }))
                  }
                />
                <span>빨강 우선</span>
              </label>

              <label className="srsField">
                <span>모드</span>
                <select
                  value={settings.mode}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, mode: e.target.value }))
                  }
                >
                  <option value="learn">인식</option>
                  <option value="type">철자</option>
                  <option value="choice">객관식</option>
                  <option value="dict">받아쓰기</option>
                </select>
              </label>

              <label className="srsField">
                <span>방향</span>
                <select
                  value={settings.srsDirection || "RU_KO"}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, srsDirection: e.target.value }))
                  }
                >
                  <option value="RU_KO">RU → KO (러→한)</option>
                  <option value="KO_RU">KO → RU (한→러)</option>
                </select>
              </label>

              <label className="srsCheck">
                <input
                  type="checkbox"
                  checked={!!settings.sessionAutoRepeat}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      sessionAutoRepeat: e.target.checked,
                    }))
                  }
                />
                <span>자동 반복</span>
              </label>

              <label className="srsCheck">
                <input
                  type="checkbox"
                  checked={!!settings.sessionAutoCycleMode}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      sessionAutoCycleMode: e.target.checked,
                    }))
                  }
                />
                <span>모드 자동 전환</span>
              </label>
            </div>

            <div className="srsModalFooter">
              <div className="srsHint">대기 카드 기준으로 시작됩니다</div>
              <button
                className="primary"
                onClick={() => {
                  setSrsSettingsOpen(false);
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 통계 */}
      <div className="bpStatsPanel">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <StatCard title="총 단어" value={totalWords} />
          <StatCard title="대기/기한" value={dueCount} />
          <StatCard title="오늘 복습(단어)" value={todayReviewed} />
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>색상 분포</div>
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 12,
                  borderRadius: 8,
                  background: "var(--panel-strong)",
                  overflow: "hidden",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    width: `${ratio(cnt.green)}%`,
                    background: MARK_STYLE.green.bg,
                  }}
                />
                <div
                  style={{
                    width: `${ratio(cnt.yellow)}%`,
                    background: MARK_STYLE.yellow.bg,
                  }}
                />
                <div
                  style={{
                    width: `${ratio(cnt.red)}%`,
                    background: MARK_STYLE.red.bg,
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {cnt.green}/{cnt.yellow}/{cnt.red}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add words/관리 (개별 추가 UI 제거) — 섹션 순서 재배치 반영됨 */}
      {/* Add words/관리 (개별 추가 UI 제거) — 섹션 순서 재배치 반영됨 */}
      <AddWord
        onBulk={handleBulkImport}
        onDelete={(id) => setWords((ws) => ws.filter((w) => w.id !== id))}
        onDeleteMany={(ids) =>
          setWords((ws) => ws.filter((w) => !ids.includes(w.id)))
        }
        onUpdate={(id, changes) =>
          setWords((ws) =>
            ws.map((w) => {
              if (w.id !== id) return w;

              // ✅ 1) 기본 필드 업데이트
              let nextWord = { ...w, ...changes };

              // ✅ 2) 표시색(mark) 변경은 SRS(Spaced Repetition)와 유기적으로 연동
              // - green/yellow/red 로 직접 바꾸면: SRS에서 해당 난이도를 선택한 것처럼 SM-2 업데이트
              // - 해제("")면: 스케줄은 그대로 두고 mark만 해제
              if (Object.prototype.hasOwnProperty.call(changes || {}, "mark")) {
                const m = (changes.mark || "").trim();

                if (m === "green" || m === "yellow" || m === "red") {
                  const q = m === "green" ? 5 : m === "yellow" ? 3 : 1;
                  const srsNext = sm2(w, q);
                  nextWord = { ...srsNext, ...changes, mark: m, seen: true };
                } else {
                  nextWord = { ...nextWord, mark: "" };
                }

                // ✅ 3) 클라우드(progress)에도 mark/스케줄을 함께 저장
                saveProgressCloud(id, {
                  reps: nextWord.reps,
                  interval: nextWord.interval,
                  ef: nextWord.ef,
                  due: nextWord.due,
                  last: nextWord.last,
                  seen: !!nextWord.seen,
                  mark: nextWord.mark || null,
                });
              }

              return nextWord;
            })
          )
        }
        words={words}
        settings={settings}
        setSettings={setSettings}
        playRU={playRU}
        // ✅ Step2: 폴더별 일괄재생(프리셋 포함)
        getFolderPlayPref={getFolderPlayPref}
        patchFolderPlayPref={patchFolderPlayPref}
        runPlayerFromList={runPlayerFromList}
        onStop={onStop}
        // ✅ 폴더별 가독성 모드
        getFolderViewPref={getFolderViewPref}
        patchFolderViewPref={patchFolderViewPref}
        isReadMode={isReadMode}
        onClearAll={() => {
          if (
            confirm(
              "정말 모든 단어를 삭제할까요? 이 작업은 되돌릴 수 없습니다."
            )
          )
            setWords([]);
        }}
      />

      {/* (moved) 설정 패널은 우측 상단 🔧 팝업으로 이동 */}

      <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}></div>
    </div>
  );
}

// ===== Sub Components =====
function StatCard({ title, value }) {
  return (
    <div className="card">
      <div className="sub" style={{ fontSize: 12 }}>
        {title}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}
function VoiceSettings({ settings, setSettings, voices }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 8,
        marginTop: 8,
      }}
    >
      <div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
          러시아어 음성
        </div>
        <select
          value={settings.ruVoiceName}
          onChange={(e) =>
            setSettings((s) => ({ ...s, ruVoiceName: e.target.value }))
          }
          style={{ width: "100%" }}
        >
          <option value="">자동 선택 (ru)</option>
          {voices
            .filter((v) => /ru/i.test(v.lang) || /ru/i.test(v.name))
            .map((v) => (
              <option key={v.name + v.lang} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
        </select>
        <button
          onClick={() => speakRU("привет", settings)}
          style={{ marginTop: 6 }}
        >
          RU 테스트
        </button>
      </div>
      <div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
          한국어 음성
        </div>
        <select
          value={settings.koVoiceName}
          onChange={(e) =>
            setSettings((s) => ({ ...s, koVoiceName: e.target.value }))
          }
          style={{ width: "100%" }}
        >
          <option value="">자동 선택 (ko)</option>
          {voices
            .filter((v) => /ko/i.test(v.lang) || /ko/i.test(v.name))
            .map((v) => (
              <option key={v.name + v.lang} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
        </select>
        <button
          onClick={() => speakKO("안녕하세요", settings)}
          style={{ marginTop: 6 }}
        >
          KO 테스트
        </button>
      </div>

      <div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
          음량/속도/피치
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            rowGap: 6,
            alignItems: "center",
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          <label>
            Vol{" "}
            <NumField
              value={settings.ttsVolume}
              min={0}
              max={1}
              allowFloat
              width={60}
              title="0~1"
              onCommit={(v) =>
                setSettings((s) => ({ ...s, ttsVolume: clamp(v, 0, 1) }))
              }
            />
          </label>
          <label>
            Rate{" "}
            <NumField
              value={settings.ttsRate}
              min={0.5}
              max={2}
              allowFloat
              width={60}
              title="0.5~2"
              onCommit={(v) =>
                setSettings((s) => ({ ...s, ttsRate: clamp(v, 0.5, 2) }))
              }
            />
          </label>
          <label>
            Pitch{" "}
            <NumField
              value={settings.ttsPitch}
              min={0}
              max={2}
              allowFloat
              width={60}
              title="0~2"
              onCommit={(v) =>
                setSettings((s) => ({ ...s, ttsPitch: clamp(v, 0, 2) }))
              }
            />
          </label>
        </div>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 6,
          }}
        >
          <input
            type="checkbox"
            checked={settings.cancelBeforeSpeak}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                cancelBeforeSpeak: e.target.checked,
              }))
            }
          />{" "}
          speak 전에 cancel()
        </label>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 6,
          }}
        >
          <input
            type="checkbox"
            checked={!!settings.translit}
            onChange={(e) =>
              setSettings((s) => ({ ...s, translit: e.target.checked }))
            }
          />{" "}
          영→러 변환(자동)
        </label>
      </div>
    </div>
  );
}

function NumField({
  value,
  onCommit,
  min,
  max,
  allowFloat = false,
  width = 64,
  placeholder = "",
  title = "",
}) {
  const [raw, setRaw] = useState(value === 0 || value ? String(value) : "");
  useEffect(() => {
    const next = value === 0 || value ? String(value) : "";
    setRaw(next);
  }, [value]);
  const parse = (s) => {
    if (typeof s !== "string") return null;
    const cleaned = s.replace(",", ".").trim();
    if (cleaned === "") return null;
    const n = allowFloat ? parseFloat(cleaned) : parseInt(cleaned, 10);
    if (Number.isNaN(n)) return null;
    let v = n;
    if (typeof min === "number") v = Math.max(min, v);
    if (typeof max === "number") v = Math.min(max, v);
    return v;
  };
  const commit = () => {
    const v = parse(raw);
    if (v === null) {
      setRaw(value === 0 || value ? String(value) : "");
      return;
    }
    onCommit(v);
    setRaw(String(v));
  };
  return (
    <input
      type="text"
      inputMode={allowFloat ? "decimal" : "numeric"}
      pattern={allowFloat ? "[0-9]*[.,]?[0-9]*" : "[0-9]*"}
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      placeholder={placeholder}
      title={title}
      style={{ width }}
    />
  );
}

function ColorButton({ color, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        color: "#0f172a",
        border: "1px solid rgba(15,23,42,.25)",
        padding: "10px 14px",
        borderRadius: 14,
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "inset 0 -2px 0 rgba(0,0,0,.08)",
      }}
    >
      {label}
    </button>
  );
}

function StudyCard({
  current,
  settings,
  setSettings,
  frontChoice,
  backChoice,
  showBack,
  setShowBack,
  thumbEmoji,
  playRU,
}) {
  const [typed, setTyped] = useState("");
  const norm = (s) =>
    (s || "")
      .trim()
      .toLowerCase()
      .normalize("NFC")
      .replace(/ё/g, "е")
      .replace(/\s+/g, " ");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setTyped("");

      if (!showBack) {
        // ✅ 자동 재생은 TTS만
        await speakRU(current.ru, settings);
        if (cancelled) return;

        // iOS에서 너무 짧은 gap은 떨림/울먹임 체감이 생길 수 있음
        const gap = clamp(settings.gapMs ?? 450, 350, 2000);
        await sleep(gap);
        if (cancelled) return;

        // ✅ 2회 반복은 원할 때만 (기본 1회 추천)
        if ((settings.repeatRU ?? 2) >= 2) {
          await speakRU(current.ru, settings);
        }
        return;
      }

      await speakKO(current.ko, settings);
    };

    run();
    return () => {
      cancelled = true;
      try {
        window.speechSynthesis?.cancel();
      } catch {}
    };
  }, [
    current.id,
    showBack,
    settings.ruVoiceName,
    settings.koVoiceName,
    settings.ttsRate,
    settings.ttsPitch,
    settings.ttsVolume,
  ]);

  return (
    <div style={{ marginTop: 12, display: "grid", gap: 16 }}>
      {/* 이미지/이모지 */}
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 24,
          background: "var(--panel-strong)",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
        }}
      >
        {current.img ? (
          /^https?:\/\//.test(current.img) ? (
            <img
              alt=""
              src={current.img}
              style={{ width: 180, height: 180, objectFit: "cover" }}
            />
          ) : (
            <div style={{ fontSize: 80 }}>
              {extractFirstEmoji(current.img) || current.img}
            </div>
          )
        ) : thumbEmoji ? (
          <div style={{ fontSize: 80 }}>{thumbEmoji}</div>
        ) : (
          <div style={{ width: 180, height: 180 }} />
        )}
      </div>

      {settings.mode === "learn" ? (
        <div
          style={{
            display: "grid",
            gridTemplateRows: "auto auto auto",
            rowGap: 8,
            minHeight: 260,
          }}
        >
          {/* KO 줄 */}
          <div
            style={{
              fontSize: 28,
              marginTop: 8,
              visibility: showBack ? "visible" : "hidden",
              minHeight: 34,
            }}
            aria-hidden={!showBack}
          >
            {current.ko || " "}
          </div>
          {/* RU 줄 */}
          <div
            onClick={() => playRU(current)}
            style={{
              fontSize: 44,
              fontWeight: 800,
              marginTop: 8,
              cursor: "pointer",
            }}
          >
            {current.ru}
          </div>
          {/* 버튼 줄 */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 20,
              alignItems: "center",
            }}
          >
            <ColorButton
              color="#68e0a3"
              label="쉽당"
              onClick={() => (showBack ? backChoice(5) : frontChoice(5))}
            />
            <ColorButton
              color="#fff088"
              label="보통"
              onClick={() => (showBack ? backChoice(3) : frontChoice(3))}
            />
            <ColorButton
              color="#ff9a9a"
              label="어렵당"
              onClick={() => (showBack ? backChoice(1) : frontChoice(1))}
            />
            <button
              onClick={() => backChoice()}
              style={{
                marginLeft: 12,
                padding: "8px 12px",
                borderRadius: 10,
                visibility: showBack ? "visible" : "hidden",
              }}
            >
              ▶ 다음
            </button>
          </div>
        </div>
      ) : !showBack ? (
        <div>
          <div
            onClick={() => playRU(current)}
            style={{
              fontSize: 44,
              fontWeight: 800,
              marginTop: 8,
              cursor: "pointer",
            }}
          >
            {current.ru}
          </div>
          {(settings.mode === "type" || settings.mode === "dict") && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                {settings.mode === "dict"
                  ? "받아쓰기: 들리는 러시아어를 입력"
                  : "철자: 한국어 뜻을 보고 러시아어 입력"}
              </div>
              {settings.mode === "type" && (
                <div style={{ fontSize: 14, color: "#dbeafe", marginTop: 4 }}>
                  {current.ko}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <input
                  value={typed}
                  onChange={(e) =>
                    setTyped(
                      settings.translit
                        ? translitToRu(e.target.value)
                        : e.target.value
                    )
                  }
                  placeholder="러시아어 철자"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => {
                    const ok = norm(typed) === norm(current.ru);
                    setShowBack(true);
                    if (!ok) {
                    }
                  }}
                >
                  확인
                </button>
                <button onClick={() => playRU(current)}>🔊</button>
              </div>
              <CyrillicPad
                onPick={(ch) => {
                  const el = document.activeElement;
                  setTyped((t) => (t || "") + ch);
                  if (el && el.tagName === "INPUT") el.focus();
                }}
              />
              <label
                style={{
                  display: "inline-flex",
                  gap: 6,
                  alignItems: "center",
                  marginTop: 6,
                  fontSize: 12,
                }}
              >
                <input
                  type="checkbox"
                  checked={!!settings.translit}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, translit: e.target.checked }))
                  }
                />{" "}
                영→러 변환(자동)
              </label>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <ColorButton
              color="#68e0a3"
              label="쉽당"
              onClick={() => frontChoice(5)}
            />
            <ColorButton
              color="#fff088"
              label="보통"
              onClick={() => frontChoice(3)}
            />
            <ColorButton
              color="#ff9a9a"
              label="어렵당"
              onClick={() => frontChoice(1)}
            />
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 28, marginTop: 8 }}>{current.ko}</div>
          <div style={{ fontSize: 40, fontWeight: 800, marginTop: 8 }}>
            {current.ru}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <ColorButton
              color="#68e0a3"
              label="쉽당"
              onClick={() => backChoice(5)}
            />
            <ColorButton
              color="#fff088"
              label="보통"
              onClick={() => backChoice(3)}
            />
            <ColorButton
              color="#ff9a9a"
              label="어렵당"
              onClick={() => backChoice(1)}
            />
            <button
              onClick={() => backChoice()}
              style={{ marginLeft: 12, padding: "8px 12px", borderRadius: 10 }}
            >
              ▶ 다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CyrillicPad({ onPick }) {
  const rows = [
    "й ц у к е н г ш щ з х ъ".split(" "),
    "ф ы в а п р о л д ж э".split(" "),
    "я ч с м и т ь б ю ё".split(" "),
  ];
  return (
    <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
      {rows.map((r, ri) => (
        <div key={ri} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {r.map((k) => (
            <button
              key={k}
              onClick={() => onPick(k)}
              style={{ padding: "4px 8px", borderRadius: 6 }}
            >
              {k}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/** ===== 단어 추가/관리 (순서: 내 단어 → 선택 작업 → 가져오기/관리) ===== */
function AddWord({
  onBulk,
  onDelete,
  onDeleteMany,
  onClearAll,
  onUpdate,
  words,
  settings,
  setSettings,
  playRU,

  // ✅ 폴더별 일괄재생/신호등/설정 저장
  getFolderPlayPref,
  patchFolderPlayPref,
  runPlayerFromList,
  onStop,

  // ✅ (추가) 폴더별 "가독성 모드"
  getFolderViewPref,
  patchFolderViewPref,
  isReadMode,
}) {
  const [bulk, setBulk] = useState("");
  const [bulkFolder, setBulkFolder] = useState("");
  const [selected, setSelected] = useState({});
  const [markFilter, setMarkFilter] = useState("전체");
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);
  const recordingWordIdRef = useRef(null);
  const [isFolderPlaying, setIsFolderPlaying] = useState(false);
  const stopFolderPlayRef = useRef(false);

  const foldersFromWords = useMemo(
    () =>
      Array.from(new Set(words.map((w) => w.folder || DEFAULT_FOLDER))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [words]
  );
  // ✅ Apply default folder-play settings to ALL existing folders
  function applyDefaultFolderPlayPrefsAll() {
    const label = applyAllOrder === "KO_RU" ? "KO→RU" : "RU→KO";
    const ok = window.confirm(
      `모든 폴더에 아래 기본값을 적용할까요?
(RU x${applyAllRU}, KO x${applyAllKO}, 방향: ${label})`
    );
    if (!ok) return;

    setSettings((prev) => {
      const next = { ...(prev || {}) };

      // 글로벌 기본값도 함께 맞춤
      next.repeatRU = applyAllRU;
      next.repeatKO = applyAllKO;

      const map = { ...(next.folderPlayPrefs || {}) };
      const allFolders = [DEFAULT_FOLDER, ...(foldersFromWords || [])];

      allFolders.forEach((f) => {
        map[f] = {
          ...(map[f] || {}),
          bulkOrder: applyAllOrder,
          repeatRU: applyAllRU,
          repeatKO: applyAllKO,
          gapMs: map[f]?.gapMs ?? next.gapMs ?? 1000,
          loopRounds: map[f]?.loopRounds ?? next.loopRounds ?? 1,
        };
      });

      next.folderPlayPrefs = map;
      return next;
    });
  }

  const toggle = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  // fix selectedIds bug (s undefined) → correct:
  const selectedIdsSafe = () =>
    Object.keys(selected).filter((k) => selected[k]);

  const deleteSelected = () => {
    const ids = selectedIdsSafe();
    if (!ids.length) return alert("선택된 단어가 없습니다.");
    if (confirm(`${ids.length}개 단어를 삭제할까요?`)) onDeleteMany(ids);
    setSelected({});
  };

  // 표시 필터
  const wordsFiltered = useMemo(
    () =>
      words.filter((w) =>
        markFilter === "전체" ? true : w.mark === markFilter
      ),
    [words, markFilter]
  );

  // 폴더 최초 생성시각
  const folderCreatedAt = useMemo(() => {
    const m = new Map();
    words.forEach((w) => {
      const f = w.folder || DEFAULT_FOLDER;
      const t = w.created || 0;
      if (!m.has(f)) m.set(f, t);
      else m.set(f, Math.min(m.get(f), t));
    });
    return m;
  }, [words]);

  // 그룹
  const groupsRaw = useMemo(() => {
    const map = new Map();
    wordsFiltered.forEach((w) => {
      const f = w.folder || DEFAULT_FOLDER;
      if (!map.has(f)) map.set(f, []);
      map.get(f).push(w);
    });
    return Array.from(map.entries());
  }, [wordsFiltered]);

  // ✅ AddWord 내부: mp3 녹음 시작
  const startRecording = async (wordId) => {
    try {
      recordedChunksRef.current = [];
      recordingWordIdRef.current = wordId;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        try {
          // 마이크 스트림 정리
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }

          const chunks = recordedChunksRef.current || [];
          recordedChunksRef.current = [];

          const targetId = recordingWordIdRef.current;
          recordingWordIdRef.current = null;

          if (!targetId) return;
          if (!chunks.length) {
            alert("녹음 데이터가 없습니다.");
            return;
          }

          const blob = new Blob(chunks, {
            type: recorder.mimeType || "audio/webm",
          });

          // 기존 오디오키 있으면 삭제(안전)
          const targetWord = words.find((x) => x.id === targetId);
          if (targetWord?.audioKey) {
            try {
              await idbDeleteAudio(targetWord.audioKey);
            } catch {}
          }

          // 저장
          const key = `a_${targetId}_${Date.now()}`;
          await idbPutAudio({
            key,
            blob,
            mime: blob.type || "audio/webm",
            updatedAt: Date.now(),
          });

          // 단어 업데이트 + 출처 기록
          onUpdate(targetId, {
            audioKey: key,
            audioMime: blob.type || "audio/webm",
            mp3Source: "record",
          });
        } catch (err) {
          console.error(err);
          alert("녹음 저장 중 오류가 발생했습니다.");
        } finally {
          setIsRecording(false);
          recorderRef.current = null;
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("녹음 시작 실패:", err);
      alert("녹음 시작 실패: 마이크 권한/장치를 확인해주세요.");
      setIsRecording(false);
      recorderRef.current = null;
      recordingWordIdRef.current = null;
    }
  };

  // ✅ AddWord 내부: mp3 녹음 중지
  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    try {
      recorder.stop();
    } catch (err) {
      console.error("녹음 중지 실패:", err);
      setIsRecording(false);
      recorderRef.current = null;
      recordingWordIdRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      alert("녹음 중지에 실패했습니다.");
    }
  };

  // 사용자 정렬 키 확보
  useEffect(() => {
    if ((settings.folderSort || "name") !== "custom") return;
    const names = groupsRaw.map(([name]) => name);
    const order = { ...(settings.folderOrder || {}) };
    let changed = false;
    let nextIdx = Object.values(order).length
      ? Math.max(...Object.values(order)) + 1
      : 1;
    names.forEach((n) => {
      if (!(n in order)) {
        order[n] = nextIdx++;
        changed = true;
      }
    });
    if (changed) setSettings((s) => ({ ...s, folderOrder: order }));
  }, [groupsRaw, settings.folderSort, settings.folderOrder, setSettings]);

  const groups = useMemo(() => {
    const sortKey = settings.folderSort || "name";

    // ✅ 폴더 우선순위: 📍(pinned) > ⭐(favorite) > 일반
    const folderPriority = (name) => {
      const p =
        (typeof getFolderViewPref === "function"
          ? getFolderViewPref(name)
          : {}) || {};
      if (p.pinned) return 0;
      if (p.favorite) return 1;
      return 2;
    };

    const withPriority = (cmp) => (a, b) => {
      const pa = folderPriority(a[0]);
      const pb = folderPriority(b[0]);
      if (pa !== pb) return pa - pb;
      return cmp(a, b);
    };

    const byName = (a, b) => a[0].localeCompare(b[0]);
    const byCreated = (a, b) =>
      (folderCreatedAt.get(a[0]) || 0) - (folderCreatedAt.get(b[0]) || 0);
    const byCustom = (a, b) => {
      const oa =
        (settings.folderOrder && settings.folderOrder[a[0]]) ??
        Number.MAX_SAFE_INTEGER;
      const ob =
        (settings.folderOrder && settings.folderOrder[b[0]]) ??
        Number.MAX_SAFE_INTEGER;
      if (oa !== ob) return oa - ob;
      return byName(a, b);
    };
    const arr = groupsRaw.slice();
    if (sortKey === "created") arr.sort(withPriority(byCreated));
    else if (sortKey === "custom") arr.sort(withPriority(byCustom));
    else arr.sort(withPriority(byName));
    return arr;
  }, [
    groupsRaw,
    settings.folderSort,
    settings.folderOrder,
    folderCreatedAt,
    getFolderViewPref,
  ]);

  const isCollapsed = (name) => !!(settings.collapsedFolders || {})[name];
  const toggleFolder = (name) =>
    setSettings((s) => ({
      ...s,
      collapsedFolders: {
        ...(s.collapsedFolders || {}),
        [name]: !isCollapsed(name),
      },
    }));

  // ===== RU/KO 개별 숨김 (기본: 둘 다 보임) =====
  // settings.collapsedSentences[id] = { ru: boolean, ko: boolean }

  const getCellHidden = (id) => {
    const v = (settings.collapsedSentences || {})[id];

    if (v === true) return { ru: false, ko: true }; // 과거 호환
    if (!v) return { ru: false, ko: false };

    if (typeof v === "object") {
      return { ru: !!v.ru, ko: !!v.ko };
    }

    return { ru: false, ko: false };
  };

  const isRuHidden = (id) => getCellHidden(id).ru;
  const isKoHidden = (id) => getCellHidden(id).ko;

  const setCellHidden = (id, patch) =>
    setSettings((s) => {
      const prev = (s.collapsedSentences || {})[id];

      const cur =
        prev === true
          ? { ru: false, ko: true }
          : prev && typeof prev === "object"
          ? { ru: !!prev.ru, ko: !!prev.ko }
          : { ru: false, ko: false };

      return {
        ...s,
        collapsedSentences: {
          ...(s.collapsedSentences || {}),
          [id]: { ...cur, ...(patch || {}) },
        },
      };
    });

  const toggleRu = (id) => setCellHidden(id, { ru: !isRuHidden(id) });
  const toggleKo = (id) => setCellHidden(id, { ko: !isKoHidden(id) });

  // 기존 버튼 깨지지 않게 유지
  const collapseAllSentences = () =>
    setSettings((s) => ({
      ...s,
      collapsedSentences: Object.fromEntries(
        wordsFiltered.map((w) => [w.id, { ru: true, ko: false }])
      ),
    }));

  const expandAllSentences = () =>
    setSettings((s) => ({
      ...s,
      collapsedSentences: Object.fromEntries(
        wordsFiltered.map((w) => [w.id, { ru: false, ko: false }])
      ),
    }));

  // 혹시 남아있는 호출 대비 안전 매핑
  const toggleSentence = (id) => toggleKo(id);
  const isSentenceCollapsed = (id) => isKoHidden(id);

  const getRepeatHint = (settings) => {
    const ruRaw = Number(settings?.repeatRU ?? 1);
    const koRaw = Number(settings?.repeatKO ?? 1);
    const ru = Number.isFinite(ruRaw) ? ruRaw : 1;
    const ko = Number.isFinite(koRaw) ? koRaw : 1;

    // 1회 이하면 툴팁 없음 (0은 '재생 안 함'이므로 표시하지 않음)
    if (ru <= 1 && ko <= 1) return "";

    const parts = [];
    if (ru > 1) parts.push(`RU×${ru}`);
    if (ko > 1) parts.push(`KO×${ko}`);
    return parts.join(" / ");
  };

  const collapseAll = () =>
    setSettings((s) => ({
      ...s,
      collapsedFolders: Object.fromEntries(groupsRaw.map(([n]) => [n, true])),
    }));
  const expandAll = () => setSettings((s) => ({ ...s, collapsedFolders: {} }));

  function moveFolder(name, dir) {
    if ((settings.folderSort || "name") !== "custom") return;
    const order = { ...(settings.folderOrder || {}) };
    const list = groups.map(([n]) => n);
    const i = list.indexOf(name);
    const j = i + (dir === "up" ? -1 : 1);
    if (i < 0 || j < 0 || j >= list.length) return;
    const a = list[i],
      b = list[j];
    const tmp = order[a] ?? i + 1;
    order[a] = order[b] ?? j + 1;
    order[b] = tmp;
    setSettings((s) => ({ ...s, folderOrder: order }));
  }

  // ✅ 폴더 삭제 (App 컴포넌트 안에서! words / setWords 접근 가능)
  function deleteFolder(folderName) {
    const ok = window.confirm("폴더를 삭제하시겠습니까?");
    if (!ok) return;

    // 이 폴더에 속한 단어 id들
    const idsInFolder = words
      .filter((w) => (w.folder || DEFAULT_FOLDER) === folderName)
      .map((w) => w.id);

    if (!idsInFolder.length) {
      // 폴더에 단어가 없으면: 접힘/정렬 정보만 정리하고 끝(선택)
      setSettings((s) => {
        const cf = { ...(s.collapsedFolders || {}) };
        delete cf[folderName];
        const fo = { ...(s.folderOrder || {}) };
        delete fo[folderName];
        return { ...s, collapsedFolders: cf, folderOrder: fo };
      });
      return;
    }
    // ✅ 단어 실제 삭제는 상위(App)에서 처리하도록 콜백 사용
    onDeleteMany(idsInFolder);

    // 선택 상태 정리
    setSelected((prev) => {
      const next = { ...prev };
      idsInFolder.forEach((id) => delete next[id]);
      return next;
    });

    // 폴더 접힘/정렬 정보 정리
    setSettings((s) => {
      const cf = { ...(s.collapsedFolders || {}) };
      delete cf[folderName];

      const fo = { ...(s.folderOrder || {}) };
      delete fo[folderName];

      return { ...s, collapsedFolders: cf, folderOrder: fo };
    });

    // 편집 중인 항목이 삭제된 폴더에 있었으면 닫기
    if (editId && idsInFolder.includes(editId)) setEditId(null);
  }
  // ✅ 폴더 이름 변경 (AddWord 내부!)
  function renameFolder(oldName) {
    const nextRaw = window.prompt("새 폴더명을 입력하세요", oldName);
    if (nextRaw === null) return;

    const nextName = String(nextRaw || "").trim();
    if (!nextName) {
      alert("폴더명은 비워둘 수 없습니다.");
      return;
    }
    if (nextName === oldName) return;

    const exists = words.some((w) => (w.folder || DEFAULT_FOLDER) === nextName);
    if (exists) {
      const ok = window.confirm(
        `이미 '${nextName}' 폴더가 있습니다. '${oldName}'의 단어를 그 폴더로 합칠까요?`
      );
      if (!ok) return;
    }

    const idsInFolder = words
      .filter((w) => (w.folder || DEFAULT_FOLDER) === oldName)
      .map((w) => w.id);

    if (!idsInFolder.length) return;

    idsInFolder.forEach((id) => onUpdate(id, { folder: nextName }));

    // 편집 중인 항목 폴더도 동기화
    if (editId) {
      const w = words.find((x) => x.id === editId);
      if (w && (w.folder || DEFAULT_FOLDER) === oldName) {
        setEdit((e) => ({ ...e, folder: nextName }));
      }
    }

    // 접힘 / 사용자 정렬 / 폴더 뷰/재생 프리셋 키 이동 (ver27.0.4: rename 시 설정 유지)
    setSettings((s) => {
      const cf = { ...(s.collapsedFolders || {}) };
      const fo = { ...(s.folderOrder || {}) };
      const fv = { ...(s.folderViewPrefs || {}) };
      const fp = { ...(s.folderPlayPrefs || {}) };

      const oldCollapsed = cf[oldName];
      const oldOrder = fo[oldName];
      const oldView = fv[oldName];
      const oldPlay = fp[oldName];

      delete cf[oldName];
      delete fo[oldName];
      delete fv[oldName];
      delete fp[oldName];

      if (oldCollapsed !== undefined && !(nextName in cf))
        cf[nextName] = oldCollapsed;
      if (oldOrder !== undefined && !(nextName in fo)) fo[nextName] = oldOrder;

      // ✅ 핵심: 폴더 이름만 바뀌어도 📍/⭐/가독성(readMode) 유지
      if (oldView !== undefined && !(nextName in fv)) fv[nextName] = oldView;

      // ✅ 폴더별 재생 기본값도 유지
      if (oldPlay !== undefined && !(nextName in fp)) fp[nextName] = oldPlay;

      return {
        ...s,
        collapsedFolders: cf,
        folderOrder: fo,
        folderViewPrefs: fv,
        folderPlayPrefs: fp,
      };
    });
  }

  const [batchFolder, setBatchFolder] = useState("");
  const moveSelected = () => {
    const ids = selectedIdsSafe();
    if (!ids.length) return alert("선택된 단어가 없습니다.");
    const to = batchFolder || DEFAULT_FOLDER;
    ids.forEach((id) => onUpdate(id, { folder: to }));
    setSelected({});
  };
  const markSelected = (mark) => {
    const ids = selectedIdsSafe();
    if (!ids.length) return alert("선택된 단어가 없습니다.");
    ids.forEach((id) => onUpdate(id, { mark }));
    setSelected({});
  };
  const clearMarkSelected = () => {
    const ids = selectedIdsSafe();
    if (!ids.length) return alert("선택된 단어가 없습니다.");
    ids.forEach((id) => onUpdate(id, { mark: null }));
    setSelected({});
  };

  // 편집
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState({
    ru: "",
    ko: "",
    ipa: "",
    img: "",
    folder: DEFAULT_FOLDER,
    ruAudio: "",
  });
  function startEdit(w) {
    setEditId(w.id);
    setEdit({
      ru: w.ru,
      ko: w.ko,
      emoji: w.emoji || "",
      ipa: w.ipa || "",
      img: w.img || "",
      folder: w.folder || DEFAULT_FOLDER,
      ruAudio: w.ruAudio || "",
    });
  }
  function saveEdit() {
    if (!editId) return;

    // 1) 단어 자체에 emoji 포함해서 저장
    onUpdate(editId, {
      ...edit,
      emoji: (edit.emoji || "").trim(), // ✅ emoji 필드 확실히 저장
    });

    // 2) 뜻(ko) → emoji 학습 저장
    const em = (edit.emoji || "").trim();
    if (em && em !== "📌") {
      saveEmojiOverride(edit.ko, em);
    } else {
      // 비우거나 📌면 학습 제거
      saveEmojiOverride(edit.ko, "");
    }

    setEditId(null);
  }

  // =========================
  // ✅ 단어별 재생횟수(playN) 지원
  // - playN 기본값: 1
  // - ▶ 클릭 시 playN만큼 반복 재생
  // - 2~49: 파란색, 50+: 빨간색
  // =========================
  const getPlayN = (w) => {
    const n = parseInt(w?.playN ?? 1, 10);
    return Number.isFinite(n) ? Math.max(1, Math.min(999, n)) : 1;
  };

  const getPlayBtnStyle = (w, ms) => {
    const n = getPlayN(w);
    const baseColor = ms?.fg || "var(--fg)";

    // ✅ playN에 따라 "삼각형(▶/⏸) 색"만 변경
    if (n >= 50) return { color: "rgba(255,70,70,0.95)" }; // 빨강
    if (n >= 2) return { color: "rgba(120,180,255,0.95)" }; // 파랑

    return { color: baseColor };
  };

  const playWordNTimes = async (w) => {
    const n = getPlayN(w);

    // 이미 같은 단어가 반복재생 중이면 여기선 그냥 리턴(버튼 onClick에서 stop 처리)
    if (playingWordId === w?.id) return;

    // 새로운 반복재생 시작
    stopRepeatRef.current = false;

    // 2회 이상일 때만 "재생 중" UI를 보여주기
    if (n >= 2) setPlayingWordId(w.id);

    try {
      for (let k = 0; k < n; k++) {
        if (stopRepeatRef.current) break;

        // RU 재생
        await playRU(w);

        if (stopRepeatRef.current) break;

        // 반복 간 간격(너무 길면 답답하니 상한 500ms)
        const gap = Math.max(0, parseInt(settings.gapMs ?? 0, 10));
        if (gap) await sleep(Math.min(gap, 100));
      }
    } finally {
      // 종료 처리
      stopRepeatRef.current = false;
      if (n >= 2) setPlayingWordId(null);
    }
  };

  // ✅ (추가) 폴더 ... 메뉴 / 설정 모달 상태
  const [folderMenuOpen, setFolderMenuOpen] = useState(null); // folderName | null
  const [flashFolderName, setFlashFolderName] = useState(null);

  // =========================
  // ✅ ver27.0.2: 폴더 순서 수동 조정 (… 메뉴에서 위/아래 한 칸)
  // - 이동 시 정렬 기준을 custom으로 자동 전환
  // - 📍/⭐ 우선순위(고정/즐겨찾기) 그룹은 유지하고, 같은 그룹 안에서만 이동
  // =========================
  const folderPriorityTop = (name) => {
    const p =
      (typeof getFolderViewPref === "function"
        ? getFolderViewPref(name)
        : {}) || {};
    if (p.pinned) return 0;
    if (p.favorite) return 1;
    return 2;
  };

  const ensureFolderOrderTop = (names) => {
    const order = { ...(settings.folderOrder || {}) };
    let nextIdx =
      Object.keys(order).length > 0 ? Math.max(...Object.values(order)) + 1 : 1;
    let changed = false;
    names.forEach((n) => {
      if (!(n in order)) {
        order[n] = nextIdx++;
        changed = true;
      }
    });
    if (changed) setSettings((s) => ({ ...s, folderOrder: order }));
    return order;
  };

  const moveFolderStep = (name, dir) => {
    // dir: -1 (up) | +1 (down)
    const names = (groups || []).map((g) => g[0]);
    if (!names.length) return;

    const pr = folderPriorityTop(name);
    const idx = names.indexOf(name);
    if (idx < 0) return;

    const j = idx + dir;
    if (j < 0 || j >= names.length) return;
    if (folderPriorityTop(names[j]) !== pr) return; // 그룹 경계 넘기지 않음

    const order = ensureFolderOrderTop(names);
    const a = name;
    const b = names[j];

    const oa = order[a] ?? Number.MAX_SAFE_INTEGER;
    const ob = order[b] ?? Number.MAX_SAFE_INTEGER;

    const nextOrder = { ...order, [a]: ob, [b]: oa };

    setSettings((s) => ({
      ...s,
      folderSort: "custom",
      folderOrder: nextOrder,
    }));

    // 이동 피드백(짧은 하이라이트)
    setFlashFolderName(name);
    window.clearTimeout(window.__bpFolderFlashT);
    window.__bpFolderFlashT = window.setTimeout(() => {
      setFlashFolderName(null);
    }, 650);
  };

  const [folderSettingsOpen, setFolderSettingsOpen] = useState(null); // folderName | null

  // ✅ (추가) 단어 반복재생 중 일시정지(중지) 지원
  const [playingWordId, setPlayingWordId] = useState(null); // 현재 반복재생 중인 단어 id
  const stopRepeatRef = useRef(false); // true면 반복 루프 중단\

  // ✅ (추가) 헤더 RU/KO/전체 반복 횟수 "직접 입력" 숫자패드 모달
  const [numPad, setNumPad] = useState(null);
  // numPad: { folderName, key, label, min, max, valueStr }

  const openNumPad = ({
    folderName,
    key,
    label,
    cur = 1,
    min = 0,
    max = 999,
  }) => {
    const v = Number(cur);
    const safe = Number.isFinite(v) ? v : min;
    setNumPad({
      folderName,
      key,
      label,
      min,
      max,
      valueStr: String(safe),
    });
  };

  const closeNumPad = () => setNumPad(null);

  const applyNumPad = () => {
    if (!numPad) return;
    const raw = String(numPad.valueStr || "").trim();
    const n = parseInt(raw || "0", 10);
    const min = Number(numPad.min ?? 0) || 0;
    const max = Number(numPad.max ?? 999) || 999;
    const val = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

    patchFolderPlayPref?.(numPad.folderName, { [numPad.key]: val });
    closeNumPad();
  };

  const numPadInput = (digit) => {
    setNumPad((p) => {
      if (!p) return p;
      const cur = String(p.valueStr || "");
      const next = cur === "0" ? String(digit) : cur + String(digit);
      // 너무 길어지는 입력 방지 (최대 2~3자리면 충분)
      if (next.length > 3) return p;
      return { ...p, valueStr: next };
    });
  };

  const numPadBackspace = () => {
    setNumPad((p) => {
      if (!p) return p;
      const cur = String(p.valueStr || "");
      const next = cur.length <= 1 ? "0" : cur.slice(0, -1);
      return { ...p, valueStr: next };
    });
  };

  const numPadClear = () => {
    setNumPad((p) => (p ? { ...p, valueStr: "0" } : p));
  };

  // ===== UI (순서 재배치) =====
  return (
    <div
      className="rd"
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* =========================
          ✅ (7단계) UI Polish: 전역 버튼/모달/입력/호버/간격 통일
          - styles.css가 없어도 App.js만으로 보정
         ========================= */}

      {/* 1) 내 단어 */}
      <b>✏️ 내 단어 ({words.length})</b>

      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid #ffffff33",
        }}
      >
        <div className="bpWordListControls">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div className="sub" style={{ fontSize: 14 }}>
              총 {words.length}개
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <label style={{ fontSize: 14 }}>
                표시
                <select
                  value={markFilter}
                  onChange={(e) => setMarkFilter(e.target.value)}
                  style={{ marginLeft: 6 }}
                >
                  <option value="전체">전체</option>
                  <option value="green">초록</option>
                  <option value="yellow">노랑</option>
                  <option value="red">빨강</option>
                </select>
              </label>
              <label style={{ fontSize: 14 }}>
                폴더 정렬
                <select
                  value={settings.folderSort || "name"}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, folderSort: e.target.value }))
                  }
                  style={{ marginLeft: 6 }}
                >
                  <option value="name">이름순</option>
                  <option value="created">생성순(최초 추가)</option>
                  <option value="custom">사용자 순</option>
                </select>
              </label>
              <button onClick={collapseAll}>📘</button>
              <button onClick={expandAll}>📖</button>
              <button type="button" onClick={collapseAllSentences}>
                RU
              </button>
              <button type="button" onClick={expandAllSentences}>
                KO
              </button>
            </div>
          </div>
        </div>

        {groups.map(([folderName, list]) => {
          const pref =
            typeof getFolderPlayPref === "function"
              ? getFolderPlayPref(folderName)
              : {
                  bulkOrder: "RU_KO",
                  playOrder: "asc",
                  repeatRU: settings.repeatRU,
                  repeatKO: settings.repeatKO,
                  gapMs: settings.gapMs,
                  tlMode: "all",
                };

          // ✅ 폴더 표시 설정 (📍/⭐)
          const viewPref =
            typeof getFolderViewPref === "function"
              ? getFolderViewPref(folderName)
              : { pinned: false, favorite: false };

          // ✅ 신호등 모드 순환: off > g > y > yr > r > on > all > off
          const nextMode = nextTlMode(pref.tlMode || "off");

          // ✅ 신호등 모드 → 허용 색(mark)
          const allowedMarks = tlModeToSet(pref.tlMode || "off");

          // ✅ 목록 표시도 신호등 필터 반영
          const visibleList = allowedMarks
            ? allowedMarks === "__UNLEARNED__"
              ? (Array.isArray(list) ? list : []).filter((w) => !w?.mark)
              : (Array.isArray(list) ? list : []).filter((w) =>
                  allowedMarks.has(w?.mark)
                )
            : Array.isArray(list)
            ? list
            : [];

          const applyPresetWord = (e) => {
            e.stopPropagation();
            patchFolderPlayPref?.(folderName, {
              bulkOrder: "KO_RU",
              playOrder: "asc",
              repeatRU: 3,
              repeatKO: 1,
              gapMs: 700,
            });
          };

          const applyPresetSentence = (e) => {
            e.stopPropagation();
            patchFolderPlayPref?.(folderName, {
              bulkOrder: "RU_KO",
              playOrder: "asc",
              repeatRU: 1,
              repeatKO: 0, // ✅ 문장 폴더는 RU만 듣고 싶을 때 유용
              gapMs: 1200,
            });
          };

          const buildPlayList = () => {
            let arr = Array.isArray(list) ? list.slice() : [];

            // ✅ 1. 신호등 필터(재생 대상도 동일)
            if (allowedMarks) {
              if (allowedMarks === "__UNLEARNED__") {
                arr = arr.filter((w) => !w?.mark);
              } else {
                arr = arr.filter((w) => allowedMarks.has(w?.mark));
              }
            }

            // ✅ 2. 정렬
            if (pref.playOrder === "desc") arr.reverse();
            else if (pref.playOrder === "shuffle") {
              arr = seededShuffle(arr, Date.now());
            }

            return arr;
          };

          const playFolderFromTop = (e) => {
            e.stopPropagation();
            const arr = buildPlayList();
            runPlayerFromList?.(arr, 0, pref);
          };

          // ✅ 신호등 UI 상태 계산(켜짐/꺼짐)
          const tl = (() => {
            const mode = pref.tlMode || "off";
            const onG = mode === "g" || mode === "on";
            const onY = mode === "y" || mode === "yr" || mode === "on";
            const onR = mode === "r" || mode === "yr" || mode === "on";
            return { mode, onG, onY, onR };
          })();

          const dim = "rgba(255,255,255,0.25)";
          const gCol = tl.onG ? "#5ee17a" : dim;
          const yCol = tl.onY ? "#ffd24d" : dim;
          const rCol = tl.onR ? "#ff5c5c" : dim;

          const dotStyle = (bg) => ({
            width: 14,
            height: 14,
            borderRadius: 999,
            background: bg,
            border: "1px solid rgba(0,0,0,0.25)",
          });

          return (
            <div key={folderName} style={{ marginTop: 8 }}>
              {/* ✅ 폴더 헤더: 단순화 (▸▾ 제거, 우측 컨트롤 제거, …만 남김) */}
              <div
                className={`folderGlassCard ${
                  flashFolderName === folderName ? "bpFolderFlash" : ""
                }`}
                style={{
                  fontWeight: 700,
                  background: "var(--panel)",
                  border: "1px solid var(--line)",
                  padding: "10px 12px",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  gap: 10,
                }}
                onClick={() => toggleFolder(folderName)}
                title="클릭하여 접기/펼치기"
              >
                <div
                  className="folderGlassTitle"
                  style={{ display: "flex", gap: 8, alignItems: "baseline" }}
                >
                  {viewPref?.pinned ? (
                    <span style={{ opacity: 0.95, marginRight: 2 }}>📍</span>
                  ) : null}
                  {!viewPref?.pinned && viewPref?.favorite ? (
                    <span style={{ opacity: 0.95, marginRight: 2 }}>⭐</span>
                  ) : null}
                  <span style={{ opacity: 0.9 }}>
                    {isCollapsed(folderName) ? "📁" : "📂"}
                  </span>
                  <span className="folderNameText">{folderName}</span>
                  <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                    ({list.length})
                  </span>
                </div>

                {/* ✅ … 버튼 (2단계에서 모달/메뉴 연결) */}
                <button
                  className="btnMini iconBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderMenuOpen(folderName);
                  }}
                  title="폴더 설정"
                  aria-label="folder-menu"
                  style={{
                    width: 40,
                    height: 32,
                    borderRadius: 10,
                    fontSize: 20,
                    lineHeight: "20px",
                  }}
                >
                  …
                </button>
              </div>
              {/* ===========================
                  ✅ (2단계) 폴더 메뉴 모달
                  - 폴더 이름 편집
                  - 폴더 삭제
                  - 일괄 재생 설정(모달 열기)
                  =========================== */}
              {folderMenuOpen === folderName && (
                <div
                  onClick={() => setFolderMenuOpen(null)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.75)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                    padding: 16,
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: "min(420px, 92vw)",
                      background: "var(--panel)",
                      border: "1px solid var(--line)",
                      borderRadius: 16,
                      padding: 14,
                    }}
                  >
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>
                      {folderName}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {/* ✅ 폴더 고정/즐겨찾기 */}
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          className="btn"
                          onClick={() => {
                            // 📍 토글: 켜면 ⭐는 해제(우선순위 명확)
                            patchFolderViewPref(folderName, {
                              pinned: !viewPref?.pinned,
                              favorite: viewPref?.pinned
                                ? viewPref?.favorite
                                : false,
                            });
                          }}
                          style={{
                            flex: 1,
                            opacity: viewPref?.pinned ? 1 : 0.85,
                            borderColor: viewPref?.pinned
                              ? "rgba(255,255,255,0.35)"
                              : undefined,
                          }}
                        >
                          📍 고정 {viewPref?.pinned ? "✓" : ""}
                        </button>

                        <button
                          className="btn"
                          onClick={() => {
                            // ⭐ 토글: 켜면 📍은 해제
                            patchFolderViewPref(folderName, {
                              favorite: !viewPref?.favorite,
                              pinned: viewPref?.favorite
                                ? viewPref?.pinned
                                : false,
                            });
                          }}
                          style={{
                            flex: 1,
                            opacity: viewPref?.favorite ? 1 : 0.85,
                            borderColor: viewPref?.favorite
                              ? "rgba(255,255,255,0.35)"
                              : undefined,
                          }}
                        >
                          ⭐ 즐겨 {viewPref?.favorite ? "✓" : ""}
                        </button>
                      </div>

                      {/* ✅ 폴더 위치 이동 (ver27.0.3) */}
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          className="btn"
                          onClick={() => {
                            moveFolderStep(folderName, -1);
                            setFolderMenuOpen(null);
                          }}
                          style={{ flex: 1, opacity: 0.9 }}
                          title="위로 한 칸"
                        >
                          ⬆️ 위로
                        </button>
                        <button
                          className="btn"
                          onClick={() => {
                            moveFolderStep(folderName, +1);
                            setFolderMenuOpen(null);
                          }}
                          style={{ flex: 1, opacity: 0.9 }}
                          title="아래로 한 칸"
                        >
                          ⬇️ 아래로
                        </button>
                      </div>
                      {/* ✅ 가독성 모드 토글 (폴더 이름 편집 위) */}
                      <button
                        className="btn bpReadToggleBtn"
                        onClick={() => {
                          const cur = isReadMode(folderName);
                          patchFolderViewPref(folderName, { readMode: !cur });
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center", // 🔥 center 로 변경
                          gap: 10,
                          position: "relative", // 🔥 추가
                        }}
                      >
                        <span className="bpReadToggleLabel">가독성 모드</span>

                        {/* iOS 스타일 토글(표시용) */}
                        <span
                          className={`bpIosToggle ${
                            isReadMode(folderName) ? "on" : ""
                          }`}
                          aria-hidden="true"
                          style={{ position: "absolute", right: 16 }} // 🔥 추가
                        >
                          <span className="bpIosToggleKnob" />
                        </span>
                      </button>

                      <button
                        className="btn"
                        onClick={() => {
                          setFolderMenuOpen(null);
                          renameFolder(folderName);
                        }}
                      >
                        폴더 이름 편집
                      </button>

                      <button
                        className="btn"
                        onClick={() => {
                          setFolderMenuOpen(null);
                          deleteFolder(folderName);
                        }}
                      >
                        폴더 삭제
                      </button>

                      <button
                        className="btn"
                        onClick={() => {
                          setFolderMenuOpen(null);
                          setFolderSettingsOpen(folderName);
                        }}
                      >
                        일괄 재생 설정
                      </button>

                      <button
                        className="btn"
                        onClick={() => setFolderMenuOpen(null)}
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* ===========================
                  ✅ (2단계) 폴더 일괄재생 설정 모달
                  - 폴더별 저장(patchFolderPlayPref)
                  =========================== */}
              {folderSettingsOpen === folderName && (
                <div
                  onClick={() => setFolderSettingsOpen(null)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.75)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                    padding: 16,
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: "min(560px, 94vw)",
                      background: "var(--panel)",
                      border: "1px solid var(--line)",
                      borderRadius: 16,
                      padding: 14,
                    }}
                  >
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>
                      일괄 재생 설정 · {folderName}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <label style={{ fontSize: 13 }}>
                        RU/KO 순서
                        <select
                          value={pref.bulkOrder || "RU_KO"}
                          onChange={(e) =>
                            patchFolderPlayPref?.(folderName, {
                              bulkOrder: e.target.value,
                            })
                          }
                          style={{ width: "100%", marginTop: 6 }}
                        >
                          <option value="RU_KO">RU → KO</option>
                          <option value="KO_RU">KO → RU</option>
                        </select>
                      </label>

                      <label style={{ fontSize: 13 }}>
                        진행 순서
                        <select
                          value={pref.playOrder || "asc"}
                          onChange={(e) =>
                            patchFolderPlayPref?.(folderName, {
                              playOrder: e.target.value,
                            })
                          }
                          style={{ width: "100%", marginTop: 6 }}
                        >
                          <option value="asc">위 → 아래</option>
                          <option value="desc">아래 → 위</option>
                          <option value="shuffle">셔플</option>
                        </select>
                      </label>

                      <label style={{ fontSize: 13 }}>
                        RU 반복
                        <input
                          type="number"
                          min={0}
                          max={999}
                          value={pref.repeatRU ?? 2}
                          onChange={(e) =>
                            patchFolderPlayPref?.(folderName, {
                              repeatRU: parseInt(e.target.value || "0", 10),
                            })
                          }
                          style={{ width: "100%", marginTop: 6 }}
                        />
                      </label>

                      <label style={{ fontSize: 13 }}>
                        KO 반복
                        <input
                          type="number"
                          min={0}
                          max={999}
                          value={pref.repeatKO ?? 1}
                          onChange={(e) =>
                            patchFolderPlayPref?.(folderName, {
                              repeatKO: parseInt(e.target.value || "0", 10),
                            })
                          }
                          style={{ width: "100%", marginTop: 6 }}
                        />
                      </label>

                      <label style={{ fontSize: 13 }}>
                        전체 반복(라운드)
                        <input
                          type="number"
                          min={1}
                          max={999}
                          value={pref.loopRounds ?? 1}
                          onChange={(e) =>
                            patchFolderPlayPref?.(folderName, {
                              loopRounds: parseInt(e.target.value || "1", 10),
                            })
                          }
                          style={{ width: "100%", marginTop: 6 }}
                        />
                      </label>

                      <label style={{ fontSize: 13 }}>
                        간격(ms)
                        <input
                          type="number"
                          min={0}
                          max={10000}
                          value={pref.gapMs ?? settings.gapMs}
                          onChange={(e) =>
                            patchFolderPlayPref?.(folderName, {
                              gapMs: parseInt(e.target.value || "0", 10),
                            })
                          }
                          style={{ width: "100%", marginTop: 6 }}
                        />
                      </label>

                      <label style={{ fontSize: 13 }}>
                        배속(TTS rate)
                        <input
                          type="number"
                          step="0.05"
                          min={0.5}
                          max={2.0}
                          value={pref.ttsRate ?? 1}
                          onChange={(e) =>
                            patchFolderPlayPref?.(folderName, {
                              ttsRate: parseFloat(e.target.value || "1"),
                            })
                          }
                          style={{ width: "100%", marginTop: 6 }}
                        />
                      </label>

                      <label style={{ fontSize: 13 }}>
                        색상 필터(신호등 모드)
                        <select
                          value={pref.tlMode || "off"}
                          onChange={(e) =>
                            patchFolderPlayPref?.(folderName, {
                              tlMode: e.target.value,
                            })
                          }
                          style={{ width: "100%", marginTop: 6 }}
                        >
                          <option value="off">모든 불꺼짐 (미학습)</option>
                          <option value="g">초록</option>
                          <option value="y">노랑</option>
                          <option value="yr">노랑+빨강</option>
                          <option value="r">빨강</option>
                          <option value="on">모든 불켜짐 (초/노/빨)</option>
                          <option value="all">전체단어</option>
                        </select>
                      </label>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                        marginTop: 12,
                      }}
                    >
                      <button
                        className="btn"
                        onClick={() => setFolderSettingsOpen(null)}
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div
                className={`folderContent ${
                  isCollapsed(folderName) ? "" : "open"
                }`}
                style={{ marginTop: isCollapsed(folderName) ? 0 : 8 }}
              >
                {/* ✅ 요약바: 단어 행(bpRow)과 같은 컬럼 그리드로 정렬 */}
                <div className="bpSummary">
                  {/* 1열(#)은 비워서 단어 목록과 세로선 맞춤 */}
                  <div
                    className="bpSummaryCell bpSummaryCell--headphone"
                    title="전체 반복(라운드)"
                  >
                    <span className="bpHeadIcon"> </span>
                  </div>

                  {/* 2열(RU 컬럼) */}
                  <div
                    className="bpCountTap bpCountTap--ru"
                    role="button"
                    tabIndex={0}
                    title="탭해서 RU 반복 횟수 입력"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNumPad({
                        folderName,
                        key: "repeatRU",
                        label: "RU 반복",
                        cur: pref.repeatRU ?? 1,
                        min: 0,
                        max: 999,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      e.stopPropagation();
                      openNumPad({
                        folderName,
                        key: "repeatRU",
                        label: "RU 반복",
                        cur: pref.repeatRU ?? 1,
                        min: 0,
                        max: 999,
                      });
                    }}
                  >
                    <span className="bpRuCountText">
                      RU x{pref.repeatRU ?? 1}
                    </span>
                    <span
                      className={`bpOrderTriBtn ${
                        (pref.bulkOrder || "RU_KO") === "KO_RU"
                          ? "left"
                          : "right"
                      }`}
                      role="button"
                      tabIndex={0}
                      aria-label="재생 순서 전환"
                      title={
                        (pref.bulkOrder || "RU_KO") === "KO_RU"
                          ? "KO → RU"
                          : "RU → KO"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        const cur = pref.bulkOrder || "RU_KO";
                        const next = cur === "RU_KO" ? "KO_RU" : "RU_KO";
                        patchFolderPlayPref(folderName, { bulkOrder: next });
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" && e.key !== " ") return;
                        e.preventDefault();
                        e.stopPropagation();
                        const cur = pref.bulkOrder || "RU_KO";
                        const next = cur === "RU_KO" ? "KO_RU" : "RU_KO";
                        patchFolderPlayPref(folderName, { bulkOrder: next });
                      }}
                    >
                      {(pref.bulkOrder || "RU_KO") === "KO_RU" ? "◀" : "▶"}
                    </span>
                  </div>

                  {/* 3열(KO 컬럼) + 신호등(이동) */}
                  <div className="bpSummaryKoCell">
                    <div
                      className="bpCountTap bpCountTap--ko"
                      role="button"
                      tabIndex={0}
                      title="탭해서 KO 반복 횟수 입력"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNumPad({
                          folderName,
                          key: "repeatKO",
                          label: "KO 반복",
                          cur: pref.repeatKO ?? 1,
                          min: 0,
                          max: 999,
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" && e.key !== " ") return;
                        e.preventDefault();
                        e.stopPropagation();
                        openNumPad({
                          folderName,
                          key: "repeatKO",
                          label: "KO 반복",
                          cur: pref.repeatKO ?? 1,
                          min: 0,
                          max: 999,
                        });
                      }}
                    >
                      KO x{pref.repeatKO ?? 1}
                    </div>

                    {/* ✅ KO 칸 오른쪽에 신호등만 */}
                    <div className="bpSummaryKoRight">
                      {(() => {
                        const mode = pref.tlMode || "off";
                        const onG = mode === "g" || mode === "on";
                        const onY =
                          mode === "y" || mode === "yr" || mode === "on";
                        const onR =
                          mode === "r" || mode === "yr" || mode === "on";

                        const offG = "rgba(120, 255, 160, 0.18)";
                        const offY = "rgba(255, 220, 120, 0.18)";
                        const offR = "rgba(255, 120, 120, 0.18)";

                        const onGCol = "#4eea77";
                        const onYCol = "#ffd24d";
                        const onRCol = "#ff4d4d";

                        const dot = (isOn, onCol, offCol) => ({
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          background: isOn ? onCol : offCol,
                          border: "1px solid rgba(0,0,0,0.45)",
                          boxShadow: isOn
                            ? `0 0 7px ${onCol}, 0 0 12px ${onCol}`
                            : "inset 0 0 6px rgba(0,0,0,0.35)",
                        });

                        const nextMode = () => nextTlMode(pref.tlMode || "off");

                        return (
                          <button
                            className="iconBtn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSettings((s) => ({
                                ...s,
                                folderPlayPrefs: {
                                  ...(s.folderPlayPrefs || {}),
                                  [folderName]: {
                                    ...(s.folderPlayPrefs?.[folderName] || {}),
                                    tlMode: nextMode(),
                                  },
                                },
                              }));
                            }}
                            title="색상 필터 토글 (미학습→초록→노랑→노+빨→빨강→불켜짐→전체)"
                            aria-label="traffic-light"
                            style={{
                              width: 40,
                              height: 26,
                              padding: 0,
                              borderRadius: 999,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "transparent",
                              border: "none",
                              boxShadow: "none",
                              outline: "none",
                              flex: "0 0 auto",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                flexDirection: "row",
                                gap: 6,
                                padding: "5px 6px",
                                borderRadius: 999,
                                background:
                                  "linear-gradient(180deg, rgba(25,25,25,0.85), rgba(10,10,10,0.9))",
                                border: "1px solid rgba(255,255,255,0.10)",
                                boxShadow:
                                  "inset 0 0 10px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.35)",
                              }}
                            >
                              <span style={dot(onG, onGCol, offG)} />
                              <span style={dot(onY, onYCol, offY)} />
                              <span style={dot(onR, onRCol, offR)} />
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 4열 = ⟳ 라운드만 (신호등은 KO로 이동했으니 제거) */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 34,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      className="bpLoopBadge bpCountTap bpCountTap--loop"
                      role="button"
                      tabIndex={0}
                      title="탭해서 전체 반복 횟수 입력"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNumPad({
                          folderName,
                          key: "loopRounds",
                          label: "전체 반복(라운드)",
                          cur: pref.loopRounds ?? 1,
                          min: 1,
                          max: 999,
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" && e.key !== " ") return;
                        e.preventDefault();
                        e.stopPropagation();
                        openNumPad({
                          folderName,
                          key: "loopRounds",
                          label: "전체 반복(라운드)",
                          cur: pref.loopRounds ?? 1,
                          min: 1,
                          max: 999,
                        });
                      }}
                    >
                      x{pref.loopRounds ?? 1}
                    </span>
                  </div>

                  {/* 5열(재생 자리) = ▼ */}
                  <button
                    className="folderPlayBtn"
                    onClick={async (e) => {
                      e.stopPropagation();

                      // 이미 재생 중이면 → 엔진 stop
                      if (isFolderPlaying) {
                        onStop?.();
                        setIsFolderPlaying(false);
                        return;
                      }

                      // 재생 시작 (폴더 프리셋 + 신호등 필터 + 정렬 반영된 리스트)
                      let arr = buildPlayList(folderName);

                      // ✅ 현재 스크롤에서 '헤더 바로 아래'에 온전히 보이는 첫 단어부터 재생 시작
                      const getTopVisibleWordId = () => {
                        const root =
                          e.currentTarget.closest(".folderContent") ||
                          e.currentTarget.closest(".folderBox") ||
                          e.currentTarget.parentElement;
                        const sc = root?.querySelector?.(".bpListScroll");
                        if (!sc) return null;

                        const scRect = sc.getBoundingClientRect();
                        const rows = Array.from(
                          sc.querySelectorAll(".bpRow[data-word-id]")
                        );

                        // ✅ 기준: "현재 화면에서 위쪽부터" 보이는 비율이 50% 이상인 첫 행
                        // - 완전 노출(100%)이면 당연히 통과
                        // - 상단이 살짝 잘려도 절반 이상 보이면 그 행부터 시작
                        const THRESH = 0.5;

                        for (const row of rows) {
                          const r = row.getBoundingClientRect();
                          const rowH = Math.max(
                            1,
                            r.height || row.offsetHeight || 1
                          );

                          const visibleTop = Math.max(r.top, scRect.top);
                          const visibleBottom = Math.min(
                            r.bottom,
                            scRect.bottom
                          );
                          const visibleH = visibleBottom - visibleTop;

                          if (visibleH <= 0) continue;

                          const ratio = visibleH / rowH;
                          if (ratio >= THRESH) {
                            return row.dataset.wordId || null;
                          }
                        }

                        // fallback: 그래도 못 찾으면, 위에서부터 "조금이라도" 보이는 첫 행
                        for (const row of rows) {
                          const r = row.getBoundingClientRect();
                          if (r.bottom > scRect.top + 1) {
                            return row.dataset.wordId || null;
                          }
                        }

                        return null;
                      };

                      const startId = getTopVisibleWordId();
                      if (startId) {
                        const idx = arr.findIndex(
                          (x) => String(x?.id) === String(startId)
                        );
                        if (idx > 0) {
                          arr = arr.slice(idx).concat(arr.slice(0, idx));
                        }
                      }

                      if (!arr.length) return;

                      setIsFolderPlaying(true);

                      try {
                        // ✅ runPlayerFromList 엔진을 타면 RU+KO가 settings/pref에 따라 정상 재생됨
                        await runPlayerFromList?.(arr, 0, pref);
                      } finally {
                        setIsFolderPlaying(false);
                      }
                    }}
                    title={isFolderPlaying ? "정지" : "폴더 일괄 재생"}
                  >
                    {isFolderPlaying ? "⏹" : "🎧"}
                  </button>
                </div>

                {/* 목록 */}
                <div className="bpListScroll">
                  <div className="bpList">
                    {visibleList.map((w, i) => {
                      const playFolderDownFromWord = (
                        folderName,
                        list,
                        wordId
                      ) => {
                        const pref =
                          typeof getFolderPlayPref === "function"
                            ? getFolderPlayPref(folderName)
                            : {
                                bulkOrder: "RU_KO",
                                playOrder: "asc",
                                repeatRU: settings.repeatRU,
                                repeatKO: settings.repeatKO,
                                gapMs: settings.gapMs,
                                tlMode: "all",
                              };

                        const m = pref.tlMode || "off";
                        const allowed =
                          m === "off"
                            ? "__UNLEARNED__"
                            : m === "g"
                            ? new Set(["green"])
                            : m === "y"
                            ? new Set(["yellow"])
                            : m === "yr"
                            ? new Set(["yellow", "red"])
                            : m === "r"
                            ? new Set(["red"])
                            : m === "on"
                            ? new Set(["green", "yellow", "red"])
                            : null;
                        let arr = Array.isArray(list) ? list.slice() : [];

                        if (allowed) {
                          arr = arr.filter((x) => allowed.has(x?.mark));
                        }

                        if (pref.playOrder === "desc") arr.reverse();
                        else if (pref.playOrder === "shuffle")
                          arr = seededShuffle(arr, Date.now());

                        const start = Math.max(
                          0,
                          arr.findIndex((x) => x?.id === wordId)
                        );
                        runPlayerFromList?.(arr, start, pref);
                      };

                      const ms = markStyle(w.mark);
                      const hasMp3 = !!w.audioKey; // ✅ 기기 내 mp3(IndexedDB) 저장 여부
                      const hasAudio =
                        hasMp3 || !!(w.ruAudio && w.ruAudio.trim()); // ✅ 저장 or URL 둘 다 포함한 상태표시용

                      const displayEmoji = /^https?:\/\//.test(w.img || "")
                        ? ""
                        : (w.emoji || "").trim() || // ✅ 새로 추가한 필드 최우선
                          extractEmojis(w.img || "") ||
                          extractEmojis(w.ipa || "") ||
                          extractEmojis(w.ko || "") ||
                          "";

                      return (
                        <div
                          key={w.id}
                          data-word-id={w.id}
                          className={`bpRow ${
                            settings?.folderViewPrefs?.[folderName]?.readMode
                              ? "bpRow--read"
                              : ""
                          }`}
                          style={{
                            background: ms?.bg,
                            color:
                              w.mark === "green"
                                ? "#052e16"
                                : w.mark === "yellow"
                                ? "#3b2f00"
                                : w.mark === "red"
                                ? "#3b0a0a"
                                : "var(--fg)",
                          }}
                        >
                          <div
                            className="bpIdx"
                            style={{
                              color: ms?.fg || "var(--fg)",
                              cursor: "pointer",
                              opacity: selected[w.id] ? 1 : 0.75,
                              fontWeight: selected[w.id] ? 800 : 600,
                            }}
                            onClick={() => toggle(w.id)}
                            title="클릭: 선택/해제"
                          >
                            {i + 1}
                          </div>

                          {/* RU */}
                          <div
                            className="bpRu"
                            style={{ color: ms?.fg || "var(--fg)" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRu(w.id);
                            }}
                          >
                            <span
                              className={isRuHidden(w.id) ? "bpCellHidden" : ""}
                            >
                              {w.ru || ""}
                            </span>
                          </div>

                          {/* KO */}
                          <div
                            className="bpKo"
                            style={{ color: ms?.fg || "var(--fg)" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleKo(w.id);
                            }}
                          >
                            <span
                              className={isKoHidden(w.id) ? "bpCellHidden" : ""}
                            >
                              {w.ko || ""}
                            </span>
                          </div>

                          {/* ✅ 이모지/이미지 탭 = 편집 */}
                          <div
                            className="bpEmoji bpEmojiTap"
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation(); // RU 토글 클릭과 충돌 방지
                              startEdit(w);
                            }}
                            title="탭: 편집"
                          >
                            {/^https?:\/\//.test(w.img || "") ? (
                              <img alt="" src={w.img} className="bpThumb" />
                            ) : (
                              <span className="bpEmojiText">
                                {displayEmoji}
                              </span>
                            )}
                          </div>

                          {/* ✅ 재생: 단어별 playN만큼 반복 재생 (표시는 숨김) */}
                          <div
                            className="bpPlayCell"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: 8,
                              flexWrap: "nowrap",
                            }}
                          >
                            <button
                              className={`bpPlayBtn ${hasMp3 ? "hasMp3" : ""}`}
                              style={getPlayBtnStyle(w, ms)}
                              onClick={async (e) => {
                                e.stopPropagation();

                                const n = getPlayN(w);

                                // ✅ 2회 이상이고, 지금 이 단어가 재생 중이면 -> 중지
                                if (n >= 2 && playingWordId === w.id) {
                                  stopRepeatRef.current = true;
                                  return;
                                }

                                // ✅ 재생 시작
                                await playWordNTimes(w);
                              }}
                              aria-label="play"
                              title={(() => {
                                const n = getPlayN(w);
                                const repeat = n >= 2 ? ` · 반복 ${n}회` : "";

                                // ✅ 2회 이상 반복 중이면: 일시정지 + 반복횟수
                                if (n >= 2 && playingWordId === w.id)
                                  return `일시정지(중지)${repeat}`;

                                // ✅ 기본 안내 + (2회 이상일 때만) 반복횟수
                                if (hasMp3) return `MP3 재생${repeat}`;
                                return `RU 재생${repeat}`;
                              })()}
                            >
                              <span className="playIcon">
                                {getPlayN(w) >= 2 && playingWordId === w.id
                                  ? "⏸"
                                  : "▶"}
                              </span>
                            </button>
                          </div>

                          {/* 편집 UI */}
                          {editId === w.id && (
                            <div className="bpEdit">
                              {/* 입력 필드들 */}
                              <div className="bpEditFields">
                                <div className="bpField">
                                  <input
                                    value={edit.ru}
                                    onChange={(e) =>
                                      setEdit({ ...edit, ru: e.target.value })
                                    }
                                    placeholder="러시아어"
                                  />
                                </div>

                                <div className="bpField">
                                  <input
                                    value={edit.ko}
                                    onChange={(e) =>
                                      setEdit({ ...edit, ko: e.target.value })
                                    }
                                    placeholder="한국어 뜻"
                                  />
                                </div>

                                <div className="bpField">
                                  <input
                                    value={edit.emoji || ""}
                                    onChange={(e) =>
                                      setEdit({
                                        ...edit,
                                        emoji: e.target.value,
                                      })
                                    }
                                    placeholder="예: ❤️ 😡 😢 ☠️"
                                  />
                                </div>

                                <div className="bpField">
                                  <input
                                    value={edit.ipa}
                                    onChange={(e) =>
                                      setEdit({ ...edit, ipa: e.target.value })
                                    }
                                    placeholder="IPA/이모지"
                                  />
                                </div>

                                <div className="bpField">
                                  <input
                                    value={edit.img}
                                    onChange={(e) =>
                                      setEdit({ ...edit, img: e.target.value })
                                    }
                                    placeholder="이미지 URL/이모지"
                                  />
                                </div>

                                <div className="bpField bpSpan2">
                                  <input
                                    value={edit.ruAudio}
                                    onChange={(e) =>
                                      setEdit({
                                        ...edit,
                                        ruAudio: e.target.value,
                                      })
                                    }
                                    placeholder="RU mp3 URL (Google Drive/Dropbox 등)"
                                  />
                                </div>
                              </div>

                              {/* 표시색 / 재생횟수 */}
                              <div className="bpEditMeta">
                                <div className="bpMetaRow">
                                  <div className="bpMetaLabel">표시색</div>

                                  <div className="bpMarkBtns">
                                    <button
                                      type="button"
                                      className={`markBtn markGreen ${
                                        w.mark === "green" ? "isActive" : ""
                                      }`}
                                      onClick={() =>
                                        onUpdate(w.id, { mark: "green" })
                                      }
                                      title="초록"
                                    >
                                      초록
                                    </button>

                                    <button
                                      type="button"
                                      className={`markBtn markYellow ${
                                        w.mark === "yellow" ? "isActive" : ""
                                      }`}
                                      onClick={() =>
                                        onUpdate(w.id, { mark: "yellow" })
                                      }
                                      title="노랑"
                                    >
                                      노랑
                                    </button>

                                    <button
                                      type="button"
                                      className={`markBtn markRed ${
                                        w.mark === "red" ? "isActive" : ""
                                      }`}
                                      onClick={() =>
                                        onUpdate(w.id, { mark: "red" })
                                      }
                                      title="빨강"
                                    >
                                      빨강
                                    </button>

                                    <button
                                      type="button"
                                      className={`markBtn markOff ${
                                        !w.mark ? "isActive" : ""
                                      }`}
                                      onClick={() =>
                                        onUpdate(w.id, { mark: "" })
                                      }
                                      title="해제(전체)"
                                    >
                                      해제
                                    </button>
                                  </div>
                                </div>

                                <div className="bpMetaRow">
                                  <div className="bpMetaLabel">재생횟수</div>

                                  <input
                                    className="bpPlayNInput"
                                    type="number"
                                    min={1}
                                    max={999}
                                    value={getPlayN(w)}
                                    onChange={(e) => {
                                      const next = Math.max(
                                        1,
                                        Math.min(
                                          999,
                                          parseInt(e.target.value || "1", 10)
                                        )
                                      );
                                      onUpdate(w.id, { playN: next });
                                    }}
                                  />

                                  <div className="bpMetaHint">
                                    (▶ 누르면 이 횟수만큼 반복)
                                  </div>
                                </div>
                              </div>

                              {/* 액션 영역 */}
                              <div className="bpEditActions">
                                {/* 왼쪽: mp3 관련 */}
                                <div className="bpEditActionsLeft">
                                  {/* ✅ 업로드도 label 대신 button으로 통일 */}
                                  <input
                                    id={`mp3Upload_${w.id}`}
                                    type="file"
                                    accept=".mp3,audio/mpeg,audio/mp3"
                                    style={{ display: "none" }}
                                    onChange={async (e) => {
                                      const f = e.target.files?.[0];
                                      if (!f || !editId) return;

                                      // 기존 mp3 삭제
                                      if (w.audioKey) {
                                        try {
                                          await idbDeleteAudio(w.audioKey);
                                        } catch {}
                                      }

                                      const key = `a_${editId}_${Date.now()}`;
                                      await idbPutAudio({
                                        key,
                                        blob: f,
                                        mime: f.type || "audio/mpeg",
                                        updatedAt: Date.now(),
                                      });

                                      onUpdate(editId, {
                                        audioKey: key,
                                        audioMime: f.type || "audio/mpeg",
                                        mp3Source: "upload",
                                      });

                                      e.target.value = "";
                                    }}
                                  />

                                  <button
                                    className="btnMini"
                                    onClick={() =>
                                      document
                                        .getElementById(`mp3Upload_${w.id}`)
                                        ?.click()
                                    }
                                  >
                                    🎵 업로드
                                  </button>

                                  {!isRecording ? (
                                    <button
                                      className="btnMini"
                                      onClick={() => startRecording(w.id)}
                                    >
                                      🎙️ 녹음
                                    </button>
                                  ) : (
                                    <button
                                      className="btnMini"
                                      onClick={stopRecording}
                                    >
                                      🎙️ 중지
                                    </button>
                                  )}

                                  <button
                                    className="btnMini"
                                    onClick={async () => {
                                      if (!editId || !w.audioKey) return;

                                      const ok =
                                        confirm("이 단어의 mp3를 삭제할까요?");
                                      if (!ok) return;

                                      await idbDeleteAudio(w.audioKey);
                                      onUpdate(editId, {
                                        audioKey: "",
                                        audioMime: "",
                                        mp3Source: "",
                                      });
                                    }}
                                  >
                                    🎧 삭제
                                  </button>

                                  {hasMp3 && w.mp3Source === "upload" && (
                                    <span className="mp3Status upload">
                                      mp3 파일이 등록되었습니다
                                    </span>
                                  )}
                                  {hasMp3 && w.mp3Source === "record" && (
                                    <span className="mp3Status record">
                                      녹음 파일이 저장되었습니다
                                    </span>
                                  )}
                                </div>

                                {/* 오른쪽: 저장/취소/삭제 */}
                                <div className="bpEditActionsRight">
                                  <button
                                    className="btnMini"
                                    onClick={saveEdit}
                                    title="저장"
                                  >
                                    저장
                                  </button>

                                  <button
                                    className="btnMini"
                                    onClick={() => {
                                      setEditId(null);
                                      setEdit({
                                        ru: w.ru,
                                        ko: w.ko,
                                        emoji: w.emoji || "",
                                        ipa: w.ipa || "",
                                        img: w.img || "",
                                        folder: w.folder || DEFAULT_FOLDER,
                                        ruAudio: w.ruAudio || "",
                                      });
                                    }}
                                    title="취소"
                                  >
                                    취소
                                  </button>

                                  <button
                                    className={
                                      ms ? "btnMini btnLight" : "btnMini"
                                    }
                                    onClick={() => {
                                      const ok1 =
                                        window.confirm(
                                          "정말 삭제하시겠습니까?"
                                        );
                                      if (!ok1) return;

                                      const ok2 = window.confirm(
                                        "삭제를 진행할까요? (확인=삭제 / 취소=취소)"
                                      );
                                      if (!ok2) return;

                                      onDelete(w.id);
                                      setEditId(null);
                                      setSelected((s) => {
                                        const next = { ...s };
                                        delete next[w.id];
                                        return next;
                                      });
                                    }}
                                    title="삭제"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ✅ 하단 고정 플레이어: 오픈한 폴더의 일괄재생 헤더와 동일 동작 */}
              {!isCollapsed(folderName) && (
                <>
                  <div className="bpBottomPlayerSpacer" />
                  <div className="bpBottomPlayer">
                    <div className="bpSummary bpSummary--bottom bpBottomBarV26">
                      {/* 왼쪽: RU xN  →  KO xN */}
                      <div className="bpBottomBarLang">
                        <div className="bpBottomLangBlock">
                          <div className="bpBottomLangTop">
                            <span className="bpBottomLangLabel">RU</span>

                            <button
                              className="bpBottomOrderBtn"
                              onClick={(e) => {
                                e.stopPropagation();
                                const cur = pref.bulkOrder || "RU_KO";
                                const next =
                                  cur === "RU_KO" ? "KO_RU" : "RU_KO";
                                patchFolderPlayPref(folderName, {
                                  bulkOrder: next,
                                });
                              }}
                              title={
                                (pref.bulkOrder || "RU_KO") === "KO_RU"
                                  ? "KO → RU"
                                  : "RU → KO"
                              }
                              aria-label="재생 순서 전환"
                              type="button"
                            >
                              {(pref.bulkOrder || "RU_KO") === "KO_RU"
                                ? "←"
                                : "→"}
                            </button>

                            <span className="bpBottomLangLabel">KO</span>
                          </div>

                          <div className="bpBottomLangBottom">
                            <span
                              className="bpBottomLangCount"
                              role="button"
                              tabIndex={0}
                              title="탭해서 RU 반복 횟수 입력"
                              onClick={(e) => {
                                e.stopPropagation();
                                openNumPad({
                                  folderName,
                                  key: "repeatRU",
                                  label: "RU 반복",
                                  cur: pref.repeatRU ?? 1,
                                  min: 0,
                                  max: 999,
                                });
                              }}
                              onKeyDown={(e) => {
                                if (e.key !== "Enter" && e.key !== " ") return;
                                e.preventDefault();
                                e.stopPropagation();
                                openNumPad({
                                  folderName,
                                  key: "repeatRU",
                                  label: "RU 반복",
                                  cur: pref.repeatRU ?? 1,
                                  min: 0,
                                  max: 999,
                                });
                              }}
                            >
                              x{pref.repeatRU ?? 1}
                            </span>

                            <span
                              className="bpBottomLangCount"
                              role="button"
                              tabIndex={0}
                              title="탭해서 KO 반복 횟수 입력"
                              onClick={(e) => {
                                e.stopPropagation();
                                openNumPad({
                                  folderName,
                                  key: "repeatKO",
                                  label: "KO 반복",
                                  cur: pref.repeatKO ?? 1,
                                  min: 0,
                                  max: 999,
                                });
                              }}
                              onKeyDown={(e) => {
                                if (e.key !== "Enter" && e.key !== " ") return;
                                e.preventDefault();
                                e.stopPropagation();
                                openNumPad({
                                  folderName,
                                  key: "repeatKO",
                                  label: "KO 반복",
                                  cur: pref.repeatKO ?? 1,
                                  min: 0,
                                  max: 999,
                                });
                              }}
                            >
                              x{pref.repeatKO ?? 1}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 가운데: 🎧(일괄재생) + 전체 반복 xN */}
                      <div className="bpBottomBarPlay">
                        <button
                          className={`bpBottomHeadphoneBtn ${
                            isFolderPlaying ? "playing" : ""
                          }`}
                          onClick={async (e) => {
                            e.stopPropagation();

                            // 이미 재생 중이면 → 엔진 stop
                            if (isFolderPlaying) {
                              onStop?.();
                              setIsFolderPlaying(false);
                              return;
                            }

                            // 재생 시작 (폴더 프리셋 + 신호등 필터 + 정렬 반영된 리스트)
                            let arr = buildPlayList(folderName);

                            // ✅ 현재 스크롤에서 '헤더 바로 아래'에 온전히 보이는 첫 단어부터 재생 시작
                            const getTopVisibleWordId = () => {
                              const root =
                                e.currentTarget.closest(".folderContent") ||
                                e.currentTarget.closest(".folderBox") ||
                                e.currentTarget.parentElement;
                              const sc = root?.querySelector?.(".bpListScroll");
                              if (!sc) return null;

                              const scRect = sc.getBoundingClientRect();
                              const rows = Array.from(
                                sc.querySelectorAll(".bpRow[data-word-id]")
                              );

                              // ✅ 기준: "현재 화면에서 위쪽부터" 보이는 비율이 50% 이상인 첫 행
                              // - 완전 노출(100%)이면 당연히 통과
                              // - 상단이 살짝 잘려도 절반 이상 보이면 그 행부터 시작
                              const THRESH = 0.5;

                              for (const row of rows) {
                                const r = row.getBoundingClientRect();
                                const rowH = Math.max(
                                  1,
                                  r.height || row.offsetHeight || 1
                                );

                                const visibleTop = Math.max(r.top, scRect.top);
                                const visibleBottom = Math.min(
                                  r.bottom,
                                  scRect.bottom
                                );
                                const visibleH = visibleBottom - visibleTop;

                                if (visibleH <= 0) continue;

                                const ratio = visibleH / rowH;
                                if (ratio >= THRESH) {
                                  return row.dataset.wordId || null;
                                }
                              }

                              // fallback: 그래도 못 찾으면, 위에서부터 "조금이라도" 보이는 첫 행
                              for (const row of rows) {
                                const r = row.getBoundingClientRect();
                                if (r.bottom > scRect.top + 1) {
                                  return row.dataset.wordId || null;
                                }
                              }

                              return null;
                            };

                            const startId = getTopVisibleWordId();
                            if (startId) {
                              const idx = arr.findIndex(
                                (x) => String(x?.id) === String(startId)
                              );
                              if (idx > 0) {
                                arr = arr.slice(idx).concat(arr.slice(0, idx));
                              }
                            }

                            if (!arr.length) return;

                            setIsFolderPlaying(true);

                            try {
                              // ✅ runPlayerFromList 엔진을 타면 RU+KO가 settings/pref에 따라 정상 재생됨
                              await runPlayerFromList?.(arr, 0, pref);
                            } finally {
                              setIsFolderPlaying(false);
                            }
                          }}
                          title={isFolderPlaying ? "정지" : "폴더 일괄 재생"}
                          aria-label="bulk-play"
                          type="button"
                        >
                          {isFolderPlaying ? "⏹" : "🎧"}
                        </button>

                        <span
                          className="bpLoopBadge bpCountTap bpCountTap--loop"
                          role="button"
                          tabIndex={0}
                          title="탭해서 전체 반복 횟수 입력"
                          onClick={(e) => {
                            e.stopPropagation();
                            openNumPad({
                              folderName,
                              key: "loopRounds",
                              label: "전체 반복(라운드)",
                              cur: pref.loopRounds ?? 1,
                              min: 1,
                              max: 999,
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key !== "Enter" && e.key !== " ") return;
                            e.preventDefault();
                            e.stopPropagation();
                            openNumPad({
                              folderName,
                              key: "loopRounds",
                              label: "전체 반복(라운드)",
                              cur: pref.loopRounds ?? 1,
                              min: 1,
                              max: 999,
                            });
                          }}
                        >
                          x{pref.loopRounds ?? 1}
                        </span>

                        {/* legacy ▼ (숨김용) */}
                        <button
                          className="folderPlayBtn folderPlayBtn--bottom folderPlayBtn--legacy"
                          onClick={async (e) => {
                            e.stopPropagation();

                            // 이미 재생 중이면 → 엔진 stop
                            if (isFolderPlaying) {
                              onStop?.();
                              setIsFolderPlaying(false);
                              return;
                            }

                            // 재생 시작 (폴더 프리셋 + 신호등 필터 + 정렬 반영된 리스트)
                            let arr = buildPlayList(folderName);

                            // ✅ 현재 스크롤에서 '헤더 바로 아래'에 온전히 보이는 첫 단어부터 재생 시작
                            const getTopVisibleWordId = () => {
                              const root =
                                e.currentTarget.closest(".folderContent") ||
                                e.currentTarget.closest(".folderBox") ||
                                e.currentTarget.parentElement;
                              const sc = root?.querySelector?.(".bpListScroll");
                              if (!sc) return null;

                              const scRect = sc.getBoundingClientRect();
                              const rows = Array.from(
                                sc.querySelectorAll(".bpRow[data-word-id]")
                              );

                              // ✅ 기준: "현재 화면에서 위쪽부터" 보이는 비율이 50% 이상인 첫 행
                              // - 완전 노출(100%)이면 당연히 통과
                              // - 상단이 살짝 잘려도 절반 이상 보이면 그 행부터 시작
                              const THRESH = 0.5;

                              for (const row of rows) {
                                const r = row.getBoundingClientRect();
                                const rowH = Math.max(
                                  1,
                                  r.height || row.offsetHeight || 1
                                );

                                const visibleTop = Math.max(r.top, scRect.top);
                                const visibleBottom = Math.min(
                                  r.bottom,
                                  scRect.bottom
                                );
                                const visibleH = visibleBottom - visibleTop;

                                if (visibleH <= 0) continue;

                                const ratio = visibleH / rowH;
                                if (ratio >= THRESH) {
                                  return row.dataset.wordId || null;
                                }
                              }

                              // fallback: 그래도 못 찾으면, 위에서부터 "조금이라도" 보이는 첫 행
                              for (const row of rows) {
                                const r = row.getBoundingClientRect();
                                if (r.bottom > scRect.top + 1) {
                                  return row.dataset.wordId || null;
                                }
                              }

                              return null;
                            };

                            const startId = getTopVisibleWordId();
                            if (startId) {
                              const idx = arr.findIndex(
                                (x) => String(x?.id) === String(startId)
                              );
                              if (idx > 0) {
                                arr = arr.slice(idx).concat(arr.slice(0, idx));
                              }
                            }

                            if (!arr.length) return;

                            setIsFolderPlaying(true);

                            try {
                              // ✅ runPlayerFromList 엔진을 타면 RU+KO가 settings/pref에 따라 정상 재생됨
                              await runPlayerFromList?.(arr, 0, pref);
                            } finally {
                              setIsFolderPlaying(false);
                            }
                          }}
                          aria-hidden="true"
                          tabIndex={-1}
                          type="button"
                        >
                          ▼
                        </button>
                      </div>

                      {/* 오른쪽: 신호등 */}
                      <div className="bpBottomBarTraffic">
                        {(() => {
                          const mode = pref.tlMode || "off";
                          const onG = mode === "g" || mode === "on";
                          const onY =
                            mode === "y" || mode === "yr" || mode === "on";
                          const onR =
                            mode === "r" || mode === "yr" || mode === "on";

                          const offG = "rgba(120, 255, 160, 0.18)";
                          const offY = "rgba(255, 220, 120, 0.18)";
                          const offR = "rgba(255, 120, 120, 0.18)";

                          const onGCol = "#4eea77";
                          const onYCol = "#ffd24d";
                          const onRCol = "#ff4d4d";

                          const dot = (isOn, onCol, offCol) => ({
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            background: isOn ? onCol : offCol,
                            border: "1px solid rgba(0,0,0,0.45)",
                            boxShadow: isOn
                              ? `0 0 7px ${onCol}, 0 0 12px ${onCol}`
                              : "inset 0 0 6px rgba(0,0,0,0.35)",
                          });

                          const nextMode = () =>
                            nextTlMode(pref.tlMode || "off");

                          return (
                            <button
                              className="iconBtn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSettings((s) => ({
                                  ...s,
                                  folderPlayPrefs: {
                                    ...(s.folderPlayPrefs || {}),
                                    [folderName]: {
                                      ...(s.folderPlayPrefs?.[folderName] ||
                                        {}),
                                      tlMode: nextMode(),
                                    },
                                  },
                                }));
                              }}
                              title="색상 필터 토글 (미학습→초록→노랑→노+빨→빨강→불켜짐→전체)"
                              aria-label="traffic-light"
                              style={{
                                width: 40,
                                height: 26,
                                padding: 0,
                                borderRadius: 999,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "transparent",
                                border: "none",
                                boxShadow: "none",
                                outline: "none",
                                flex: "0 0 auto",
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-flex",
                                  flexDirection: "row",
                                  gap: 6,
                                  padding: "5px 6px",
                                  borderRadius: 999,
                                  background:
                                    "linear-gradient(180deg, rgba(25,25,25,0.85), rgba(10,10,10,0.9))",
                                  border: "1px solid rgba(255,255,255,0.10)",
                                  boxShadow:
                                    "inset 0 0 10px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.35)",
                                }}
                              >
                                <span style={dot(onG, onGCol, offG)} />
                                <span style={dot(onY, onYCol, offY)} />
                                <span style={dot(onR, onRCol, offR)} />
                              </span>
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 2) 선택 항목 작업 */}
      <div
        className="bpSelectionActionsPanel"
        style={{
          marginTop: 12,
          padding: 10,
          border: "1px solid var(--line)",
          borderRadius: 8,
          background: "var(--panel)",
        }}
      >
        <b>선택 항목 작업</b>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: 6,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            개수: {selectedIdsSafe().length}
          </span>
          <label>
            이동 →
            <input
              onChange={(e) => setBatchFolder(e.target.value)}
              list="folders-datalist"
              placeholder="대상 폴더"
              style={{ width: 140, marginLeft: 6 }}
            />
          </label>
          <button onClick={moveSelected}>선택 이동</button>
          <span style={{ marginLeft: 6 }}>표시 →</span>
          <button
            onClick={() => markSelected("green")}
            style={{
              background: MARK_STYLE.green.bg,
              color: "#0f172a",
              borderRadius: 8,
              padding: "4px 8px",
            }}
          >
            초록
          </button>
          <button
            onClick={() => markSelected("yellow")}
            style={{
              background: MARK_STYLE.yellow.bg,
              color: "#0f172a",
              borderRadius: 8,
              padding: "4px 8px",
            }}
          >
            노랑
          </button>
          <button
            onClick={() => markSelected("red")}
            style={{
              background: MARK_STYLE.red.bg,
              color: "#0f172a",
              borderRadius: 8,
              padding: "4px 8px",
            }}
          >
            빨강
          </button>
          <button onClick={clearMarkSelected}>지우기</button>
          <button onClick={deleteSelected} style={{ marginLeft: "auto" }}>
            선택 삭제
          </button>
        </div>
      </div>

      {/* 3) Add words/관리 */}
      <div className="legacyImportPanel" style={{ marginTop: 12 }}>
        <b>Add words / 관리</b>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
          일괄 추가 (한 줄 = 한 단어) — <b>탭(TSV) 권장</b> / CSV는 쉼표 포함
          칸을 "따옴표"로 감싸세요.
          <br />
          예: <code>союз,"연합, 동맹, 접속사",,🤝,복습 1강</code>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <label style={{ fontSize: 12, color: "var(--muted)" }}>
            가져올 폴더 (선택)
          </label>
          <input
            value={bulkFolder}
            onChange={(e) => setBulkFolder(e.target.value)}
            list="folders-datalist"
            placeholder="비워두면 각 줄의 폴더/기본 폴더 사용"
            style={{ flex: 1 }}
          />
          <datalist id="folders-datalist">
            {[DEFAULT_FOLDER, ...foldersFromWords].map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
        </div>
        <textarea
          rows={4}
          style={{ width: "100%", marginTop: 6 }}
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder={
            'союз,"연합, 동맹, 접속사",,🤝,복습 1강\nдом,집,,🏠,복습 1강'
          }
        />
        <button
          onClick={() => onBulk(bulk, bulkFolder)}
          style={{ marginTop: 6 }}
        >
          가져오기
        </button>
        <button
          onClick={() => {
            if (confirm("정말 모든 단어를 삭제할까요?")) onClearAll();
          }}
          style={{ marginTop: 6, marginLeft: 8 }}
        >
          전체 삭제
        </button>
      </div>
      {/* ✅ 숫자패드 모달: RU/KO/전체 반복 횟수 직접 입력 */}
      {numPad && (
        <div
          className="numPadOverlay"
          onClick={(e) => {
            // 배경 클릭 닫기
            if (e.target === e.currentTarget) closeNumPad();
          }}
        >
          <div className="numPadModal" role="dialog" aria-modal="true">
            <div className="numPadHeader">
              <div className="numPadTitle">{numPad.label}</div>
              <div className="numPadRange">
                {numPad.min} ~ {numPad.max}
              </div>
            </div>

            <input
              className="numPadDisplay"
              value={numPad.valueStr}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setNumPad((p) => (p ? { ...p, valueStr: v || "0" } : p));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyNumPad();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  closeNumPad();
                }
              }}
            />

            <div className="numPadGrid" aria-label="숫자 키패드">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  className="numPadBtn"
                  onClick={() => numPadInput(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="numPadBtn numPadBtn--sub"
                onClick={numPadClear}
              >
                C
              </button>
              <button className="numPadBtn" onClick={() => numPadInput(0)}>
                0
              </button>
              <button
                className="numPadBtn numPadBtn--sub"
                onClick={numPadBackspace}
                aria-label="backspace"
              >
                ⌫
              </button>
            </div>

            <div className="numPadActions">
              <button className="btn numPadCancel" onClick={closeNumPad}>
                취소
              </button>
              <button className="btn numPadOk" onClick={applyNumPad}>
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolsPanel({ words, setWords, bare = false }) {
  const norm = (s) =>
    (s || "").trim().toLowerCase().normalize("NFC").replace(/ё/g, "е");
  const dups = useMemo(() => {
    const map = new Map();
    words.forEach((w) => {
      const key = `${norm(w.ru)}|${norm(w.ko)}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(w);
    });
    return Array.from(map.entries())
      .filter(([_, arr]) => arr.length > 1)
      .map(([k, arr]) => ({ key: k, items: arr }));
  }, [words]);

  const [findField, setFindField] = useState("ru");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  function mergeDup(items) {
    if (items.length <= 1) return;
    const keep = items.slice().sort((a, b) => a.created - b.created)[0];
    const keepId = keep.id;
    const toDelete = items.filter((i) => i.id !== keepId).map((i) => i.id);
    setWords((ws) => ws.filter((w) => !toDelete.includes(w.id)));
  }
  function applyFindReplace() {
    if (!findText) return;
    setWords((ws) =>
      ws.map((w) => {
        const v = w[findField] || "";
        if (String(v).includes(findText)) {
          return {
            ...w,
            [findField]: String(v).split(findText).join(replaceText),
          };
        }
        return w;
      })
    );
  }

  return (
    <div
      style={{
        border: bare ? "none" : "1px solid var(--line)",
        borderRadius: bare ? 0 : 12,
        padding: bare ? 0 : 12,
        marginTop: bare ? 0 : 12,
      }}
    >
      <div style={{ fontWeight: 700 }}>🧰 도구</div>
      <div
        style={{
          marginTop: 8,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 10,
        }}
      >
        <div
          style={{
            border: "1px dashed var(--line)",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <b>중복 탐지/정리</b>
          {dups.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
              중복 없음
            </div>
          ) : (
            <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
              {dups.map((d) => (
                <div
                  key={d.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontSize: 14, color: "var(--fg)" }}>
                    {d.items[0].ru} — {d.items[0].ko}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    x{d.items.length}
                  </div>
                  <button onClick={() => mergeDup(d.items)}>
                    정리(가장 오래된 것만 남김)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            border: "1px dashed #cbd5e1",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <b>찾기 / 바꾸기</b>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: 6,
            }}
          >
            <label>
              필드
              <select
                value={findField}
                onChange={(e) => setFindField(e.target.value)}
                style={{ marginLeft: 6 }}
              >
                <option value="ru">RU</option>
                <option value="ko">KO</option>
                <option value="ipa">IPA</option>
                <option value="img">이미지</option>
                <option value="folder">폴더</option>
              </select>
            </label>
            <input
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="찾을 문자열"
            />
            <input
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="바꿀 문자열"
            />
            <button onClick={applyFindReplace}>모두 바꾸기</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CloudPanel({
  cloud,
  setCloud,
  ensureFirebase,
  saveFirebaseConfig,
  signInGoogle,
  signOut,
  loadLibrary,
  createDeck,
  pullDeckToLocal,
  pushLocalToDeck,
  loadDeckJoinToLocal,
  shareLink,
  sendEmailLinkLogin,
  bare = false,
}) {
  const [cfgText, setCfgText] = useState(
    localStorage.getItem(STORAGE.fbConfig) || ""
  );
  const [newDeck, setNewDeck] = useState("나의 러시아어 덱");
  const [replacePush, setReplacePush] = useState(false);
  const [mergePull, setMergePull] = useState(true);
  const [emailForLink, setEmailForLink] = useState("");

  return (
    <div
      style={{
        border: bare ? "none" : "1px solid var(--line)",
        borderRadius: bare ? 0 : 14,
        padding: bare ? 0 : 14,
        marginTop: bare ? 0 : 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 800 }}>☁️ Cloud (선택 사항)</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          {cloud.user
            ? `로그인: ${
                cloud.user.email || cloud.user.displayName || cloud.user.uid
              }`
            : "오프라인/로컬 모드"}
        </div>
      </div>

      <div
        style={{
          marginTop: 8,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 8,
        }}
      >
        <details>
          <summary style={{ cursor: "pointer" }}>
            Firebase 설정(JSON) 붙여넣기
          </summary>
          <textarea
            rows={6}
            style={{ width: "100%", marginTop: 6 }}
            value={cfgText}
            onChange={(e) => setCfgText(e.target.value)}
            placeholder='{"apiKey":"...","authDomain":"...","projectId":"...",...}'
          />
          <button
            onClick={() => saveFirebaseConfig(cfgText)}
            style={{ marginTop: 6 }}
          >
            저장
          </button>
        </details>

        <div className="header-actions">
          <button className="pill" onClick={signInGoogle}>
            Google 로그인
          </button>
          <button className="pill" onClick={signOut}>
            로그아웃
          </button>
          <button className="pill" onClick={loadLibrary}>
            내 라이브러리 불러오기
          </button>

          <input
            value={emailForLink}
            onChange={(e) => setEmailForLink(e.target.value)}
            placeholder="이메일 입력"
            style={{ width: 220 }}
          />
          <button
            className="pill"
            onClick={() => sendEmailLinkLogin(emailForLink)}
          >
            이메일 링크 로그인
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <input
              type="checkbox"
              checked={!!cloud.enabled}
              onChange={(e) =>
                setCloud((c) => ({ ...c, enabled: e.target.checked }))
              }
            />{" "}
            진행 저장(클라우드) 사용
          </label>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            덱ID가 설정되어 있으면 학습 진행이 Firestore에 저장됩니다.
          </span>
        </div>

        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <div style={{ fontWeight: 700 }}>내 라이브러리</div>
          <div
            style={{
              marginTop: 6,
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label>
              현재 덱ID{" "}
              <input
                value={cloud.deckId}
                onChange={(e) =>
                  setCloud((c) => ({ ...c, deckId: e.target.value }))
                }
                placeholder="deckId"
                style={{ width: 240 }}
              />
            </label>
            <button onClick={loadDeckJoinToLocal}>
              덱 불러오기(진행 병합)
            </button>
            <button onClick={shareLink}>공유 링크 복사</button>
          </div>

          <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
            {cloud.library?.length ? (
              cloud.library.map((it) => (
                <div
                  key={it.deckId}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span>📁 {it.title}</span>
                  <button
                    onClick={() =>
                      setCloud((c) => ({
                        ...c,
                        deckId: it.deckId,
                        deckTitle: it.title,
                      }))
                    }
                  >
                    선택
                  </button>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                라이브러리가 비어 있습니다.
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              value={newDeck}
              onChange={(e) => setNewDeck(e.target.value)}
              placeholder="새 덱 제목"
            />
            <button onClick={() => createDeck(newDeck)}>덱 생성</button>
          </div>
        </div>

        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <div style={{ fontWeight: 700 }}>동기화</div>
          <div
            style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}
          >
            <label
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <input
                type="checkbox"
                checked={replacePush}
                onChange={(e) => setReplacePush(e.target.checked)}
              />{" "}
              업로드 시 덱 단어 전체 교체
            </label>
            <button onClick={() => pushLocalToDeck(replacePush)}>
              로컬 → 덱 업로드
            </button>

            <label
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <input
                type="checkbox"
                checked={mergePull}
                onChange={(e) => setMergePull(e.target.checked)}
              />{" "}
              다운로드 시 로컬에 병합
            </label>
            <button onClick={() => pullDeckToLocal(mergePull)}>
              덱 → 로컬 다운로드
            </button>
          </div>

          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            ※ 덱 단어는 모두가 공유하지만, <b>진행(SRS/색상)</b>은 사용자별로
            따로 저장됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemePanel({ theme, setTheme }) {
  return (
    <details className="fold theme-fold">
      <summary>🎨 테마</summary>

      <div className="fold-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 8,
          }}
        >
          <div className="card">
            <div style={{ fontWeight: 700 }}>색</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginTop: 8,
              }}
            >
              <label className="sub">
                배경 1
                <input
                  type="color"
                  value={theme.bg}
                  onChange={(e) =>
                    setTheme((t) => ({ ...t, bg: e.target.value }))
                  }
                  style={{ width: "100%" }}
                />
              </label>
              <label className="sub">
                배경 2
                <input
                  type="color"
                  value={theme.bg2}
                  onChange={(e) =>
                    setTheme((t) => ({ ...t, bg2: e.target.value }))
                  }
                  style={{ width: "100%" }}
                />
              </label>
              <label className="sub">
                본문
                <input
                  type="color"
                  value={theme.text}
                  onChange={(e) =>
                    setTheme((t) => ({ ...t, text: e.target.value }))
                  }
                  style={{ width: "100%" }}
                />
              </label>
              <label className="sub">
                보조
                <input
                  type="color"
                  value={theme.sub}
                  onChange={(e) =>
                    setTheme((t) => ({ ...t, sub: e.target.value }))
                  }
                  style={{ width: "100%" }}
                />
              </label>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700 }}>표면·보더</div>
            <ThemeRange
              label="표면"
              value={theme.surfaceAlpha}
              min={0}
              max={0.25}
              step={0.01}
              onChange={(v) => setTheme((t) => ({ ...t, surfaceAlpha: v }))}
            />
            <ThemeRange
              label="표면(강)"
              value={theme.surfaceStrongAlpha}
              min={0}
              max={0.35}
              step={0.01}
              onChange={(v) =>
                setTheme((t) => ({ ...t, surfaceStrongAlpha: v }))
              }
            />
            <ThemeRange
              label="보더"
              value={theme.borderAlpha}
              min={0}
              max={0.4}
              step={0.01}
              onChange={(v) => setTheme((t) => ({ ...t, borderAlpha: v }))}
            />
            <ThemeRange
              label="보더(연)"
              value={theme.borderSoftAlpha}
              min={0}
              max={0.3}
              step={0.01}
              onChange={(v) => setTheme((t) => ({ ...t, borderSoftAlpha: v }))}
            />
          </div>

          <div className="card">
            <div style={{ fontWeight: 700 }}>모서리</div>
            <ThemeRange
              label="기본"
              value={theme.radius}
              min={6}
              max={24}
              step={1}
              onChange={(v) => setTheme((t) => ({ ...t, radius: v }))}
            />
            <ThemeRange
              label="대형"
              value={theme.radiusLg}
              min={8}
              max={28}
              step={1}
              onChange={(v) => setTheme((t) => ({ ...t, radiusLg: v }))}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 8,
                flexWrap: "wrap",
              }}
            >
              <button
                className="btnMini"
                onClick={() => setTheme(DEFAULT_THEME)}
              >
                초기화
              </button>
              <button
                className="btnMini"
                onClick={() =>
                  setTheme({ ...DEFAULT_THEME, bg: "#0b1220", bg2: "#070b14" })
                }
              >
                Midnight
              </button>
              <button
                className="btnMini"
                onClick={() =>
                  setTheme({
                    ...DEFAULT_THEME,
                    bg: "#0f2e1e",
                    bg2: "#0a2015",
                    text: "#e7f3ea",
                  })
                }
              >
                Forest
              </button>
              <button
                className="btnMini"
                onClick={() =>
                  setTheme({
                    ...DEFAULT_THEME,
                    bg: "#1f1f1f",
                    bg2: "#111",
                    text: "#eaeaea",
                    sub: "#bdbdbd",
                  })
                }
              >
                Mono
              </button>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}

function ThemeRange({ label, value, min, max, step, onChange }) {
  return (
    <label
      className="sub"
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr 70px",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
      }}
    >
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <NumField
        value={value}
        allowFloat
        min={min}
        max={max}
        width={68}
        onCommit={(v) => onChange(v)}
      />
    </label>
  );
}
