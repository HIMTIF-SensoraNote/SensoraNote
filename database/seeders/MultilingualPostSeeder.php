<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class MultilingualPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            $this->command->error("No users found to seed posts.");
            return;
        }

        $postsData = [
            [
                'title' => 'The Industrial Revolution',
                'mapel' => 'sejarah',
                'content' => '<p>The Industrial Revolution marked a major turning point in history. It began in Great Britain in the late 18th century and quickly spread to other parts of the world. This period saw the transition from hand production methods to machines, new chemical manufacturing, and iron production processes.</p><p>One of the most significant inventions was the steam engine, improved by James Watt. This invention powered factories and transportation, leading to the rapid growth of railways and steamships. Society shifted from agrarian to urban as people moved to cities for factory jobs.</p><p>While the Industrial Revolution brought economic growth and technological advancement, it also resulted in poor working conditions and environmental pollution, highlighting the need for labor laws and environmental protection.</p>'
            ],
            [
                'title' => 'Letak Astronomis dan Geografis Indonesia',
                'mapel' => 'geografi',
                'content' => '<p>Secara astronomis, Indonesia terletak di antara 6° LU - 11° LS dan 95° BT - 141° BT. Letak ini menjadikan Indonesia memiliki iklim tropis dengan curah hujan yang tinggi serta sinar matahari sepanjang tahun.</p><p>Secara geografis, Indonesia berada di posisi silang yang sangat strategis, yaitu di antara dua benua (Asia dan Australia) dan dua samudra (Hindia dan Pasifik). Kondisi ini memberikan keuntungan besar dalam jalur perdagangan internasional.</p><p>Selain itu, letak geografis ini juga menyebabkan keragaman budaya dan hayati yang sangat kaya, menjadikan Indonesia salah satu negara megabiodiversitas di dunia.</p>'
            ],
            [
                'title' => '微分積分入門',
                'mapel' => 'matematika',
                'content' => '<p>微分積分学は、変化を数学的に表現するための強力なツールです。微分は「ある瞬間の変化率」を求め、積分は「蓄積された全体量」を計算します。これらは物理学や工学で不可欠です。</p><p>例えば、車の速度を知りたい場合、位置の関数を微分することで求めることができます。逆に、速度の関数を積分すれば、移動した距離を計算することが可能です。</p><p>アイザック・ニュートンとゴットフリート・ライプニッツによって独立に発見されたこの理論は、現代科学の基礎を築きました。</p>'
            ],
            [
                'title' => '供求关系的基本原理',
                'mapel' => 'ekonomi',
                'content' => '<p>供给和需求是市场经济中最基本的经济学概念。需求指的是消费者在不同价格水平下愿意且能够购买的商品数量；而供给则是生产者愿意且能够提供的商品数量。</p><p>当某种商品的需求大于供给时，价格通常会上涨，这被称为卖方市场。相反，当供给大于需求时，价格会下降，形成买方市场。市场均衡价格就是在供给量和需求量相等时形成的。</p><p>理解这些基本原理有助于我们分析市场趋势、制定商业策略，以及更好地理解政府宏观经济政策的意图。</p>'
            ],
            [
                'title' => 'اكتشاف النظام الشمسي',
                'mapel' => 'astronomi',
                'content' => '<p>يتكون النظام الشمسي من الشمس وكل ما يدور حولها من كواكب وأقمار وكويكبات ومذنبات. تقع الشمس في المركز وتُشكل أكثر من 99% من كتلة النظام بأكمله.</p><p>تُقسم الكواكب إلى مجموعتين: الكواكب الصخرية الداخلية مثل عطارد والزهرة والأرض والمريخ، والكواكب الغازية العملاقة الخارجية مثل المشتري وزحل وأورانوس ونبتون.</p><p>يستمر العلماء في استكشاف النظام الشمسي من خلال التلسكوبات الفضائية والمركبات غير المأهولة، مما يساعدنا على فهم أصل الأرض والبحث عن علامات للحياة خارج كوكبنا.</p>'
            ],
            [
                'title' => 'Struktur Masyarakat Moden',
                'mapel' => 'sosiologi',
                'content' => '<p>Masyarakat moden dicirikan oleh tahap kerumitan yang tinggi, pembandaran, dan pengkhususan pekerjaan. Berbanding dengan masyarakat tradisional, hubungan sosial dalam masyarakat moden lebih bersifat formal dan berasaskan peranan.</p><p>Pendidikan dan pencapaian individu memainkan peranan yang lebih besar dalam menentukan status sosial seseorang berbanding keturunan. Ini membawa kepada mobiliti sosial yang lebih tinggi dalam kalangan penduduk.</p><p>Walau bagaimanapun, pemodenan juga membawa cabaran tersendiri seperti pengasingan sosial dan ketidaksamaan ekonomi yang semakin melebar di kawasan bandar.</p>'
            ],
            [
                'title' => '산과 염기의 이해',
                'mapel' => 'kimia',
                'content' => '<p>산과 염기는 화학에서 가장 중요하고 일상적인 물질의 두 가지 범주입니다. 산은 물에 녹았을 때 수소 이온(H+)을 내놓는 물질이며, 보통 신맛이 납니다. 레몬즙이나 식초가 대표적인 예입니다.</p><p>반면, 염기는 수산화 이온(OH-)을 내놓는 물질로, 쓴맛이 나고 미끈거리는 성질이 있습니다. 비누나 세제가 염기성 물질에 해당합니다. pH 척도를 사용하여 이들의 강도를 0부터 14까지 측정할 수 있습니다.</p><p>산과 염기가 만나면 물과 염이 생성되는 중화 반응이 일어납니다. 이 원리는 제산제 복용이나 폐수 처리 등 다양한 분야에 응용되고 있습니다.</p>'
            ],
            [
                'title' => 'Las Leyes del Movimiento',
                'mapel' => 'fisika',
                'content' => '<p>Las tres leyes del movimiento formuladas por Sir Isaac Newton forman la base de la mecánica clásica. Estas leyes describen la relación entre un objeto y las fuerzas que actúan sobre él.</p><p>La primera ley establece que un objeto permanecerá en reposo o en movimiento rectilíneo uniforme a menos que actúe sobre él una fuerza externa neta. La segunda ley relaciona la fuerza, la masa y la aceleración (F=ma).</p><p>La tercera ley afirma que por cada acción hay una reacción igual y opuesta. Comprender estas leyes es fundamental para todo, desde el diseño de automóviles hasta la ingeniería aeroespacial.</p>'
            ],
            [
                'title' => 'La Théorie de l\'Évolution',
                'mapel' => 'biologi',
                'content' => '<p>La théorie de l\'évolution par sélection naturelle, proposée par Charles Darwin, est l\'un des concepts les plus unificateurs de la biologie. Elle explique comment les espèces s\'adaptent à leur environnement au fil du temps.</p><p>Le principe fondamental est que les individus possédant des caractéristiques avantageuses ont plus de chances de survivre et de se reproduire, transmettant ainsi ces traits à leur progéniture. Ce processus conduit progressivement à des changements au sein de la population.</p><p>Aujourd\'hui, la génétique moderne a confirmé et enrichi la théorie de Darwin, nous permettant de tracer l\'arbre généalogique de toute vie sur Terre grâce à l\'ADN.</p>'
            ],
            [
                'title' => 'Die Vorteile des Sprachenlernens',
                'mapel' => 'bahasa-asing',
                'content' => '<p>Das Erlernen einer neuen Sprache bietet weit mehr Vorteile als nur die Fähigkeit, in einem anderen Land zu kommunizieren. Es verbessert nachweislich kognitive Fähigkeiten wie Gedächtnis, Problemlösung und kritisches Denken.</p><p>Zweisprachige Menschen haben oft ein besseres Verständnis für ihre eigene Muttersprache und können sich leichter in andere Kulturen einfühlen. Dies fördert interkulturelle Toleranz und globales Verständnis.</p><p>Auf dem heutigen globalisierten Arbeitsmarkt ist Mehrsprachigkeit zudem eine äußerst gefragte Qualifikation, die Karrierechancen erheblich verbessern und neue berufliche Horizonte eröffnen kann.</p>'
            ]
        ];

        $this->command->info("Seeding 10 unique multilingual posts...");

        foreach ($postsData as $post) {
            $randomUser = $users->random();
            
            Post::create([
                'user_id' => $randomUser->id,
                'title' => $post['title'],
                'content' => $post['content'],
                'plain_content' => strip_tags($post['content']),
                'mapel' => $post['mapel'],
                'jenjang' => 'SMA',
                'kelas' => '10',
                'semester' => '1',
                'likes_count' => rand(5, 100),
                'comments_count' => rand(0, 20),
                'views' => rand(50, 1000),
                'is_premium' => false,
            ]);
        }

        $this->command->info('Successfully seeded 10 unique multilingual posts!');
    }
}
