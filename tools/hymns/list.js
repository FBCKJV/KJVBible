// The hymnal. Edit here, then run: node tools/build-hymns.js
//
// Only hymns whose words were published before 1928 (public domain), chosen
// from the hymns sung in Independent Baptist churches. Left out on purpose:
// texts still under copyright (How Great Thou Art, Victory in Jesus, Great Is
// Thy Faithfulness outside the US), Catholic-origin texts (Silent Night, O Come
// All Ye Faithful, Faith of Our Fathers), Unitarian authors, and texts that
// teach sinless perfection (Love Divine, All Loves Excelling).
//
// [title, author, year, category, refs]
// The words are in tools/hymns/texts.json, keyed by title.
module.exports = [
  // ── Praise and Worship
  ['Holy, Holy, Holy', 'Reginald Heber', 1826, 'Praise and Worship', 'Isaiah 6:3; Revelation 4:8'],
  ['O Worship the King', 'Robert Grant', 1833, 'Praise and Worship', 'Psalm 104:1-5'],
  ["All Hail the Power of Jesus' Name", 'Edward Perronet', 1779, 'Praise and Worship', 'Philippians 2:9-11; Revelation 19:16'],
  ['Crown Him with Many Crowns', 'Matthew Bridges', 1851, 'Praise and Worship', 'Revelation 19:12'],
  ['O for a Thousand Tongues to Sing', 'Charles Wesley', 1739, 'Praise and Worship', 'Psalm 35:28'],
  ['To God Be the Glory', 'Fanny J. Crosby', 1875, 'Praise and Worship', 'Galatians 1:5; John 3:16'],
  ['Praise Him! Praise Him!', 'Fanny J. Crosby', 1869, 'Praise and Worship', 'Psalm 150:6'],
  ['Blessed Be the Name', 'William H. Clark', 1888, 'Praise and Worship', 'Psalm 72:19'],
  ['Guide Me, O Thou Great Jehovah', 'William Williams', 1745, 'Praise and Worship', 'Exodus 13:21; Psalm 48:14'],
  ['Rejoice, the Lord Is King', 'Charles Wesley', 1744, 'Praise and Worship', 'Philippians 4:4'],
  ['Jesus Shall Reign', 'Isaac Watts', 1719, 'Praise and Worship', 'Psalm 72:8'],
  ['Come, Thou Fount of Every Blessing', 'Robert Robinson', 1758, 'Praise and Worship', '1 Samuel 7:12'],
  // ── The Blood and the Cross
  ['Nothing but the Blood', 'Robert Lowry', 1876, 'The Blood and the Cross', 'Hebrews 9:22; 1 John 1:7'],
  ['There Is Power in the Blood', 'Lewis E. Jones', 1899, 'The Blood and the Cross', 'Revelation 12:11'],
  ['When I Survey the Wondrous Cross', 'Isaac Watts', 1707, 'The Blood and the Cross', 'Galatians 6:14'],
  ['The Old Rugged Cross', 'George Bennard', 1913, 'The Blood and the Cross', '1 Corinthians 1:18'],
  ['At Calvary', 'William R. Newell', 1895, 'The Blood and the Cross', 'Luke 23:33'],
  ['At the Cross', 'Isaac Watts', 1707, 'The Blood and the Cross', 'Isaiah 53:5'],
  ['Rock of Ages', 'Augustus M. Toplady', 1776, 'The Blood and the Cross', '1 Corinthians 10:4; Isaiah 26:4'],
  ['There Is a Fountain', 'William Cowper', 1772, 'The Blood and the Cross', 'Zechariah 13:1'],
  ['When I See the Blood', 'John G. Foote', 1892, 'The Blood and the Cross', 'Exodus 12:13'],
  ['Are You Washed in the Blood?', 'Elisha A. Hoffman', 1878, 'The Blood and the Cross', 'Revelation 7:14'],
  ['Grace Greater than Our Sin', 'Julia H. Johnston', 1911, 'The Blood and the Cross', 'Romans 5:20'],
  ['Redeemed', 'Fanny J. Crosby', 1882, 'The Blood and the Cross', 'Psalm 107:2; 1 Peter 1:18-19'],
  ['Wonderful Grace of Jesus', 'Haldor Lillenas', 1918, 'The Blood and the Cross', 'Ephesians 2:8'],
  // ── Salvation and Invitation
  ['Amazing Grace', 'John Newton', 1779, 'Salvation and Invitation', 'Ephesians 2:8; 1 Chronicles 17:16'],
  ['Just As I Am', 'Charlotte Elliott', 1835, 'Salvation and Invitation', 'John 6:37'],
  ['Pass Me Not', 'Fanny J. Crosby', 1868, 'Salvation and Invitation', 'Luke 18:38'],
  ['Almost Persuaded', 'Philip P. Bliss', 1871, 'Salvation and Invitation', 'Acts 26:28'],
  ['Christ Receiveth Sinful Men', 'Erdmann Neumeister', 1718, 'Salvation and Invitation', 'Luke 15:2'],
  ['Ye Must Be Born Again', 'William T. Sleeper', 1877, 'Salvation and Invitation', 'John 3:7'],
  ['Why Do You Wait?', 'George F. Root', 1878, 'Salvation and Invitation', '2 Corinthians 6:2'],
  ['Where Will You Spend Eternity?', 'Elisha A. Hoffman', 1878, 'Salvation and Invitation', 'Matthew 25:46'],
  ['Let Jesus Come into Your Heart', 'Lelia N. Morris', 1898, 'Salvation and Invitation', 'Revelation 3:20'],
  ['Since Jesus Came into My Heart', 'Rufus H. McDaniel', 1914, 'Salvation and Invitation', '2 Corinthians 5:17'],
  ['Love Lifted Me', 'James Rowe', 1912, 'Salvation and Invitation', 'Psalm 40:2'],
  // ── Assurance and Trust
  ['Blessed Assurance', 'Fanny J. Crosby', 1873, 'Assurance and Trust', 'Hebrews 10:22'],
  ['I Know Whom I Have Believed', 'Daniel W. Whittle', 1883, 'Assurance and Trust', '2 Timothy 1:12'],
  ['The Solid Rock', 'Edward Mote', 1834, 'Assurance and Trust', 'Matthew 7:24-25; 1 Corinthians 3:11'],
  ['Standing on the Promises', 'R. Kelso Carter', 1886, 'Assurance and Trust', '2 Peter 1:4'],
  ["'Tis So Sweet to Trust in Jesus", 'Louisa M. R. Stead', 1882, 'Assurance and Trust', 'Proverbs 3:5'],
  ['Trust and Obey', 'John H. Sammis', 1887, 'Assurance and Trust', '1 Samuel 15:22'],
  ['Leaning on the Everlasting Arms', 'Elisha A. Hoffman', 1887, 'Assurance and Trust', 'Deuteronomy 33:27'],
  ['He Leadeth Me', 'Joseph H. Gilmore', 1862, 'Assurance and Trust', 'Psalm 23:2'],
  ['All the Way My Saviour Leads Me', 'Fanny J. Crosby', 1875, 'Assurance and Trust', 'Psalm 48:14'],
  ['What a Friend We Have in Jesus', 'Joseph M. Scriven', 1855, 'Assurance and Trust', 'Proverbs 18:24; Philippians 4:6'],
  ['Does Jesus Care?', 'Frank E. Graeff', 1901, 'Assurance and Trust', '1 Peter 5:7'],
  ['Leave It There', 'Charles A. Tindley', 1916, 'Assurance and Trust', 'Psalm 55:22'],
  ['Count Your Blessings', 'Johnson Oatman Jr.', 1897, 'Assurance and Trust', 'Psalm 103:2'],
  ['Will Your Anchor Hold?', 'Priscilla J. Owens', 1882, 'Assurance and Trust', 'Hebrews 6:19'],
  ['He Hideth My Soul', 'Fanny J. Crosby', 1890, 'Assurance and Trust', 'Exodus 33:22'],
  ['It Is Well with My Soul', 'Horatio G. Spafford', 1873, 'Assurance and Trust', '2 Kings 4:26'],
  // ── The Christian Life
  ['I Surrender All', 'Judson W. Van DeVenter', 1896, 'The Christian Life', 'Romans 12:1'],
  ['Take My Life and Let It Be', 'Frances R. Havergal', 1874, 'The Christian Life', 'Romans 12:1'],
  ['Have Thine Own Way, Lord', 'Adelaide A. Pollard', 1907, 'The Christian Life', 'Jeremiah 18:6'],
  ['I Need Thee Every Hour', 'Annie S. Hawks', 1872, 'The Christian Life', 'John 15:5'],
  ['Higher Ground', 'Johnson Oatman Jr.', 1898, 'The Christian Life', 'Philippians 3:14'],
  ['Draw Me Nearer', 'Fanny J. Crosby', 1875, 'The Christian Life', 'James 4:8'],
  ['Where He Leads Me', 'E. W. Blandly', 1890, 'The Christian Life', 'Luke 9:23'],
  ['Stand Up, Stand Up for Jesus', 'George Duffield Jr.', 1858, 'The Christian Life', 'Ephesians 6:13-14'],
  ['Take Time to Be Holy', 'William D. Longstaff', 1882, 'The Christian Life', '1 Peter 1:16'],
  ['More About Jesus', 'Eliza E. Hewitt', 1887, 'The Christian Life', '2 Peter 3:18'],
  ['Yield Not to Temptation', 'Horatio R. Palmer', 1868, 'The Christian Life', '1 Corinthians 10:13'],
  ['Blest Be the Tie That Binds', 'John Fawcett', 1782, 'The Christian Life', 'Ephesians 4:3; Galatians 6:2'],
  // ── Soulwinning and Missions
  ['Rescue the Perishing', 'Fanny J. Crosby', 1869, 'Soulwinning and Missions', 'Jude 1:22-23'],
  ['Send the Light', 'Charles H. Gabriel', 1890, 'Soulwinning and Missions', 'Acts 13:47; Matthew 5:16'],
  ['Let the Lower Lights Be Burning', 'Philip P. Bliss', 1871, 'Soulwinning and Missions', 'Matthew 5:16'],
  ['I Love to Tell the Story', 'A. Katherine Hankey', 1866, 'Soulwinning and Missions', 'Psalm 66:16'],
  ['Tell Me the Old, Old Story', 'A. Katherine Hankey', 1866, 'Soulwinning and Missions', '1 Corinthians 15:3-4'],
  ['The Ninety and Nine', 'Elizabeth C. Clephane', 1868, 'Soulwinning and Missions', 'Luke 15:4'],
  ['Throw Out the Life-Line', 'Edward S. Ufford', 1888, 'Soulwinning and Missions', 'Jude 1:23'],
  ['To the Work', 'Fanny J. Crosby', 1869, 'Soulwinning and Missions', 'John 9:4'],
  // ── Prayer and the Word
  ['Sweet Hour of Prayer', 'William W. Walford', 1845, 'Prayer and the Word', 'Matthew 6:6'],
  ['I Must Tell Jesus', 'Elisha A. Hoffman', 1893, 'Prayer and the Word', 'Hebrews 4:16'],
  ['Did You Think to Pray?', 'Mary A. Kidder', 1876, 'Prayer and the Word', '1 Thessalonians 5:17'],
  ['Thy Word Have I Hid in My Heart', 'Ernest O. Sellers', 1908, 'Prayer and the Word', 'Psalm 119:11, 105'],
  // ── Heaven and His Coming
  ['When We All Get to Heaven', 'Eliza E. Hewitt', 1898, 'Heaven and His Coming', 'John 14:2-3'],
  ['When the Roll Is Called Up Yonder', 'James M. Black', 1893, 'Heaven and His Coming', '1 Thessalonians 4:16-17'],
  ['In the Sweet By and By', 'S. Fillmore Bennett', 1868, 'Heaven and His Coming', 'Hebrews 11:16'],
  ['Face to Face', 'Carrie E. Breck', 1898, 'Heaven and His Coming', '1 Corinthians 13:12'],
  ['Christ Returneth', 'H. L. Turner', 1878, 'Heaven and His Coming', 'Acts 1:11'],
  ['Is It the Crowning Day?', 'George W. Whitcomb', 1913, 'Heaven and His Coming', 'Titus 2:13'],
  ["There's a Great Day Coming", 'Will L. Thompson', 1887, 'Heaven and His Coming', 'Matthew 25:31-32'],
  // ── Christmas and Easter
  ['Joy to the World', 'Isaac Watts', 1719, 'Christmas and Easter', 'Psalm 98:4-9'],
  ['Hark! the Herald Angels Sing', 'Charles Wesley', 1739, 'Christmas and Easter', 'Luke 2:13-14'],
  ['Angels from the Realms of Glory', 'James Montgomery', 1816, 'Christmas and Easter', 'Luke 2:8-15'],
  ['O Little Town of Bethlehem', 'Phillips Brooks', 1868, 'Christmas and Easter', 'Micah 5:2'],
  ['Away in a Manger', 'Anonymous', 1885, 'Christmas and Easter', 'Luke 2:7'],
  ['Low in the Grave He Lay', 'Robert Lowry', 1874, 'Christmas and Easter', 'Luke 24:6'],
];
