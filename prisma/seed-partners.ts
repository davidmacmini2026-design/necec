import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '')
}

async function main() {
  // Create admin
  await prisma.adminUser.create({ data: { username: 'admin', password: 'necec2026' } })

  // Site config
  await prisma.siteConfig.create({
    data: {
      id: 'main', name: '北欧经济文化中心', nameEn: 'Nordic Economic and Culture Exchange Center',
      shortName: 'NECEC',
      description: '连接中北欧经济、文化、教育、科技、城市合作的官方枢纽与桥梁平台',
      descriptionEn: 'The official bridge connecting China and the Nordics in economy, culture, education, technology & urban cooperation',
      contactEmail: 'long.zhuoying@cnp-fi.com', contactWechat: 'NECEC_Official',
      contactLocation: 'Helsinki, Finland & Shanghai, China',
      heroVideo: '/videos/hero.mp4'
    }
  })

  // Programs
  const programs = [
    { slug: 'summer-camps', title: '芬兰沉浸式夏令营', titleEn: 'Finland Immersion Summer Camp', titleFi: 'Suomen immersiivinen kesäleiri',
      description: '深入体验北欧教育精髓，融合现象式学习与全真插班体验。',
      descriptionEn: 'Deeply experience the essence of Nordic education with phenomenon-based learning and exchange immersion.',
      descriptionFi: 'Koe syvällisesti pohjoismaisen koulutuksen ydin yhdistettynä ilmiöpohjaiseen oppimiseen.',
      content: '芬兰沉浸式夏令营为期两周，学生将深入芬兰学校全真课堂...', contentEn: '...', contentFi: '...',
      image: '/images/programs/summer-1.jpg', featured: true, sortOrder: 0 },
    { slug: 'winter-camps', title: '极地科考冬令营', titleEn: 'Arctic Expedition Winter Camp', titleFi: 'Arktinen tutkimusleiri',
      description: '深入北极圈，体验极地地理、自然科学与北欧冰雪运动。',
      descriptionEn: 'Explore the Arctic Circle and experience polar geography, natural science, and Nordic winter sports.',
      descriptionFi: 'Tutustu napapiiriin ja koe arktinen maantiede, luonnontieteet ja pohjoismaiset talviurheilulajit.',
      content: '极地科考冬令营...', contentEn: '...', contentFi: '...',
      image: '/images/programs/winter-1.jpg', featured: true, sortOrder: 1 },
    { slug: 'edu-exchange', title: '中芬教育论坛与校长交流', titleEn: 'China-Finland Education Forum', titleFi: 'Kiina-Suomi koulutusfoorumi',
      description: '推动双边职业教育、高等教育的互访与深度合作。',
      descriptionEn: 'Promote bilateral exchanges and in-depth cooperation in vocational and higher education.',
      descriptionFi: 'Edistä kahdenvälisiä vaihtoja ja syvällistä yhteistyötä ammatillisessa ja korkeakoulutuksessa.',
      content: '中芬教育论坛...', contentEn: '...', contentFi: '...',
      image: '/images/programs/edu-1.jpg', featured: false, sortOrder: 2 }
  ]
  for (const p of programs) await prisma.program.create({ data: p })

  // Team
  const team = [
    { name: 'Sam Leijonanmieli', role: '主席 (Chairman)', roleEn: 'Chairman', roleFi: 'Puheenjohtaja',
      desc: '引领中北欧高层政企互动与战略合作规划，连接芬兰顶级政商资源。目前担任芬兰Vimpeli市长。',
      descEn: 'Lead strategic cooperation between Nordic and Chinese enterprises. Currently mayor of Vimpeli, Finland.',
      descFi: 'Johtaa strategista yhteistyötä. Tällä hetkellä Vimpelin kunnanjohtaja.',
      image: '/images/team/sam.png', sortOrder: 0 },
    { name: 'Leo Long', role: '副主席 (Vice Chair)', roleEn: 'Vice Chair', roleFi: 'Varapuheenjohtaja',
      desc: '统筹双边经贸交流、商务拓展与中国区核心渠道建设。',
      descEn: 'Coordinate bilateral trade and business development.',
      descFi: 'Koordinoi kahdenvälistä kauppaa ja liiketoiminnan kehittämistä.',
      image: '/images/team/leo.png', sortOrder: 1 },
    { name: 'Hong Wang', role: '副主席 (Vice Chair)', roleEn: 'Vice Chair', roleFi: 'Varapuheenjohtaja',
      desc: '主导教育文化项目研发、研学营地建设及中方学校合作网络。',
      descEn: 'Lead education and cultural project R&D and Chinese school cooperation network.',
      descFi: 'Johtaa koulutus- ja kulttuurihankkeiden T&K:ta.',
      image: '/images/team/hong.png', sortOrder: 2 },
    { name: 'Miika', role: '副主席 (Vice Chair)', roleEn: 'Vice Chair', roleFi: 'Varapuheenjohtaja',
      desc: '负责北欧本土资源对接、机构运营与大型项目落地执行。',
      descEn: 'Responsible for Nordic local resource docking and project implementation.',
      descFi: 'Vastaa pohjoismaisesta paikallisesta resurssoinnista.',
      sortOrder: 3 },
    { name: 'Teresa Xin', role: '副主席 (Vice Chair)', roleEn: 'Vice Chair', roleFi: 'Varapuheenjohtaja',
      desc: '主导对外公共关系、国际品牌战略与大型展会峰会策划。',
      descEn: 'Leading external PR, international brand strategy and exhibition planning.',
      descFi: 'Johtaa ulkoista suhdetoimintaa ja kansainvälistä brändistrategiaa.',
      sortOrder: 4 },
    { name: 'Katja Hopia', role: '高级顾问 (Senior Advisor)', roleEn: 'Senior Advisor', roleFi: 'Vanhempi neuvonantaja',
      desc: '提供芬兰政经界高层智库支持，深度参与跨国城市发展战略。',
      descEn: 'Provide think tank support in Finnish political and economic circles.',
      descFi: 'Tukea korkean tason ajatushautomoita.',
      sortOrder: 5 },
    { name: 'Jarmo Suominen', role: '高级顾问 (Senior Advisor)', roleEn: 'Senior Advisor', roleFi: 'Vanhempi neuvonantaja',
      desc: '同济大学等知名学府特聘教授，提供学术、建筑与城市创新指导。',
      descEn: 'Professor at Tongji University providing academic and urban innovation guidance.',
      descFi: 'Professori Tongjin yliopistossa.',
      sortOrder: 6 }
  ]
  for (const t of team) await prisma.teamMember.create({ data: t })

  // Services
  const services = [
    { icon: '🌍', title: '政企互访', titleFi: 'Viralliset vierailut', titleEn: 'Official Visits',
      desc: '安排高规格政企互访，对接核心决策者。', descFi: 'Järjestä korkean tason virallisia vierailuja.', descEn: 'Arrange high-level official visits.',
      sortOrder: 0 },
    { icon: '🎓', title: '教育合作', titleFi: 'Koulutusyhteistyö', titleEn: 'Education Cooperation',
      desc: '研学夏令营、校长交流、高校合作项目。', descFi: 'Opintoleirit, rehtorivaihdot, korkeakouluyhteistyö.', descEn: 'Study camps, principal exchanges, university cooperation.',
      sortOrder: 1 },
    { icon: '💼', title: '经贸促进', titleFi: 'Kaupan edistäminen', titleEn: 'Trade Promotion',
      desc: '双边经贸展览、企业对接、市场准入咨询。', descFi: 'Kahdenväliset kaupan näyttelyt ja yritystapaamiset.', descEn: 'Bilateral trade exhibitions and business matchmaking.',
      sortOrder: 2 },
    { icon: '🏙️', title: '城市治理', titleFi: 'Kaupunkikehitys', titleEn: 'Urban Governance',
      desc: '城市规划、智慧城市、可持续发展合作。', descFi: 'Kaupunkisuunnittelu ja kestävän kehityksen yhteistyö.', descEn: 'Urban planning and sustainable development cooperation.',
      sortOrder: 3 }
  ]
  for (const s of services) await prisma.service.create({ data: s })

  // Partners
  const eduPartners = await prisma.partnerCategory.create({
    data: { category: 'education', title: '教育合作伙伴', titleEn: 'Education Partners', titleFi: 'Koulutuskumppanit', sortOrder: 0 }
  })
  const businessPartners = await prisma.partnerCategory.create({
    data: { category: 'business', title: '商务合作伙伴', titleEn: 'Business Partners', titleFi: 'Liikekumppanit', sortOrder: 1 }
  })

  const partnerItems = [
    { name: '同济大学', nameEn: 'Tongji University', nameFi: 'Tongjin yliopisto', slug: 'tongji-university',
      description: '中国顶尖综合性大学，与NECEC在建筑、城市规划、设计等领域深度合作。',
      descriptionEn: 'Top Chinese university with deep cooperation in architecture, urban planning, and design.',
      content: '同济大学是中国教育部直属的全国重点大学...', logo: '/images/partners/tongji.png',
      categoryId: eduPartners.id, sortOrder: 0, featured: true },
    { name: 'OU HE', slug: 'ou-he',
      description: '中芬教育合作创新平台。', descriptionEn: 'Sino-Finnish education cooperation innovation platform.',
      logo: '/images/partners/ouhe.png', categoryId: eduPartners.id, sortOrder: 1 },
    { name: '中爱芬', nameEn: 'EstFin Future', slug: 'china-estonia-finland',
      description: '专注芬兰教育，为孩子找到更适合的发展道路。', descriptionEn: 'Bridge for EstFin Future education cooperation.',
      logo: '/images/partners/cef.png', categoryId: eduPartners.id, sortOrder: 2 },
    { name: 'Kisakalio 体育中心', nameEn: 'Kisakalio Sports Center', slug: 'kisakalio',
      description: '芬兰最著名的综合性体育训练与营地中心，提供专业运动训练与团队建设体验。',
      descriptionEn: 'Finland\'s top sports training and camp center.',
      logo: '/images/partners/kisakalio.png', categoryId: businessPartners.id, sortOrder: 3, featured: true },
    { name: 'Pajulahti 体育中心', nameEn: 'Pajulahti Sports Center', slug: 'pajulahti',
      description: '芬兰领先的奥林匹克运动训练基地，提供多种运动训练与健康管理服务。',
      descriptionEn: 'Finland\'s leading Olympic sports training base.',
      logo: '/images/partners/pajulahti.png', categoryId: businessPartners.id, sortOrder: 4 },
    { name: 'Frosterus', slug: 'frosterus',
      description: '芬兰知名教育科技企业。', descriptionEn: 'Well-known Finnish education technology company.',
      categoryId: businessPartners.id, sortOrder: 5 },
    { name: '奥卢大学', nameEn: 'University of Oulu', slug: 'university-of-oulu',
      description: '芬兰北部最大综合性大学，在信息技术、生物科学等领域国际领先。',
      descriptionEn: 'Largest university in northern Finland, leading in IT and biosciences.',
      categoryId: eduPartners.id, sortOrder: 6 },
    { name: '坦佩雷大学', nameEn: 'Tampere University', slug: 'tampere-university',
      description: '芬兰最大应用科学大学之一，以跨学科研究著称。',
      descriptionEn: 'One of Finland\'s largest applied science universities.',
      categoryId: eduPartners.id, sortOrder: 7 },
    { name: '上海远驾', slug: 'shanghai-yuanjia',
      description: '中国领先的国际教育服务机构。', descriptionEn: 'Leading international education service provider in China.',
      categoryId: businessPartners.id, sortOrder: 8 },
    { name: 'eDorm', slug: 'edorm',
      description: '芬兰智能住宿解决方案提供商，为国际留学生提供便捷住宿服务。',
      descriptionEn: 'Finnish smart accommodation solution provider for international students.',
      categoryId: businessPartners.id, sortOrder: 9 },
    { name: '赫尔辛基大学', nameEn: 'University of Helsinki', slug: 'university-of-helsinki',
      description: '芬兰最古老、最大的学术机构，在多个学科领域享有国际声誉。',
      descriptionEn: 'Finland\'s oldest and largest academic institution.',
      categoryId: eduPartners.id, sortOrder: 10 }
  ]
  for (const p of partnerItems) await prisma.partnerItem.create({ data: p })

  console.log('Seed complete!')
}

main().then(() => prisma.$disconnect()).catch(console.error)
