/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.98468019915741, "KoPercent": 0.015319800842589047};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6873517786561265, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0015015015015015015, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9519343493552169, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.8241206030150754, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.9019019019019019, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8391959798994975, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.47705882352941176, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "6.1 Logout"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4169169169169169, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.41333333333333333, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.75, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.6190476190476191, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.75, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.014285714285714285, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [0.5, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [1.0, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.9299065420560748, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9384384384384384, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9788732394366197, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8923809523809524, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.8198198198198198, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 13055, 2, 0.015319800842589047, 474.1008042895455, 0, 3721, 370.0, 1143.0, 1376.0, 1873.880000000001, 4.463234130219771, 79.53761951832884, 3.8991974041789272], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 999, 0, 0.0, 3224.3103103103062, 1366, 6081, 3196.0, 4051.0, 4380.0, 5354.0, 0.38162704532422825, 57.377217544653995, 1.5127860728523737], "isController": true}, {"data": ["2.5 Select patient", 853, 0, 0.0, 320.8030480656504, 233, 1546, 268.0, 487.0000000000001, 638.3, 895.6800000000003, 0.3263597686021242, 7.4997360641891895, 0.22690072940738729], "isController": false}, {"data": ["Choose session", 999, 0, 0.0, 0.1991991991991994, 0, 53, 0.0, 1.0, 1.0, 1.0, 0.38211400461214284, 0.0, 0.0], "isController": false}, {"data": ["2.5 Select menacwy", 199, 0, 0.0, 408.86934673366835, 237, 1243, 286.0, 646.0, 688.0, 993.0, 0.07740049466306086, 1.819406544712593, 0.058050370997295646], "isController": false}, {"data": ["2.3 Search by first/last name", 999, 0, 0.0, 406.3803803803805, 256, 1636, 322.0, 703.0, 810.0, 1068.0, 0.382233744926507, 12.988169080633147, 0.29875387949076826], "isController": false}, {"data": ["2.5 Select td_ipv", 199, 0, 0.0, 412.6984924623114, 241, 1049, 299.0, 667.0, 751.0, 963.0, 0.07693410999412749, 1.893565398004507, 0.053643510288874055], "isController": false}, {"data": ["4.0 Vaccination for flu", 332, 0, 0.0, 2319.5030120481956, 1878, 4711, 2210.5, 2793.4, 2983.9499999999994, 3605.220000000001, 0.1271792372999848, 5.809659323526167, 0.7676842346395637], "isController": true}, {"data": ["4.0 Vaccination for hpv", 320, 0, 0.0, 2312.4, 1902, 3766, 2206.5, 2779.8, 2993.45, 3383.080000000001, 0.12455345639733799, 5.42233065096599, 0.7547875599705431], "isController": true}, {"data": ["5.8 Consent confirm", 2, 2, 100.0, 1679.0, 1356, 2002, 1679.0, 2002.0, 2002.0, 2002.0, 0.008709056547904166, 0.6441512493685935, 0.018931992066049487], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 138.14285714285705, 126, 204, 135.0, 149.0, 166.8, 204.0, 0.0790139956361699, 0.46960857172043946, 0.0476090188549969], "isController": false}, {"data": ["Get correct patient name", 997, 0, 0.0, 0.2928786359077233, 0, 46, 0.0, 1.0, 1.0, 1.0, 0.3816075130366619, 0.0, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 850, 0, 0.0, 962.096470588236, 688, 3174, 863.5, 1284.9, 1479.4499999999998, 2073.2800000000007, 0.325336809716624, 11.518403226843578, 0.4841926738360693], "isController": false}, {"data": ["6.1 Logout", 4, 0, 0.0, 148.75, 139, 157, 149.5, 157.0, 157.0, 157.0, 0.045635531825079005, 0.21792749084437144, 0.033469027734994466], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 247.0, 247, 247, 247.0, 247.0, 247.0, 247.0, 4.048582995951417, 19.33356528340081, 2.9573633603238867], "isController": false}, {"data": ["5.4 Consent route", 2, 0, 0.0, 365.5, 361, 370, 365.5, 370.0, 370.0, 370.0, 0.009002480183290498, 0.10396809633554044, 0.014004834894513438], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 406.6714285714286, 374, 607, 400.5, 428.9, 454.70000000000005, 607.0, 0.07887492802662818, 0.43658505083489113, 0.042749594780057264], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 846.9857142857145, 680, 1370, 796.0, 1027.2, 1218.0000000000002, 1370.0, 0.07869731214951589, 1.1680095215315847, 0.17407169142446632], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 199, 0, 0.0, 2375.1507537688435, 1924, 4864, 2293.0, 2710.0, 2969.0, 4331.0, 0.07687930297128848, 3.714850430760723, 0.466885498829812], "isController": true}, {"data": ["2.1 Open session", 999, 0, 0.0, 1217.9439439439464, 615, 3652, 1170.0, 1682.0, 1919.0, 2460.0, 0.3822058134307658, 6.260251052715899, 0.2509294208089832], "isController": false}, {"data": ["4.3 Vaccination confirm", 1050, 0, 0.0, 1251.3219047619052, 882, 3721, 1154.0, 1635.9, 1895.7999999999997, 2456.9300000000003, 0.3834344626512923, 7.745467796092657, 0.8927750088965926], "isController": false}, {"data": ["5.6 Consent questions", 2, 0, 0.0, 546.0, 367, 725, 546.0, 725.0, 725.0, 725.0, 0.008915953761863792, 0.10347817625280295, 0.021967725919123382], "isController": false}, {"data": ["4.1 Vaccination questions", 1050, 0, 0.0, 621.9409523809531, 365, 1842, 638.0, 769.9, 883.8999999999999, 1319.2800000000007, 0.38448525114576604, 4.387799182163254, 0.8110818644852438], "isController": false}, {"data": ["5.3 Consent parent details", 2, 0, 0.0, 366.5, 365, 368, 366.5, 368.0, 368.0, 368.0, 0.008988117708389509, 0.0957620744126265, 0.01624707605295799], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 2, 0, 0.0, 515.0, 394, 636, 515.0, 636.0, 636.0, 636.0, 0.008911782267335643, 0.1275672895259823, 0.013872442318489275], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1707.4857142857143, 1448, 2530, 1636.0, 2013.5, 2114.4, 2530.0, 0.07877888230772608, 3.8784751686149437, 0.31149970162498325], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 199, 0, 0.0, 2374.24120603015, 1880, 4340, 2261.0, 2909.0, 3197.0, 3472.0, 0.07735259762850151, 3.6588899246298054, 0.4690036461886353], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 564.0, 564, 564, 564.0, 564.0, 564.0, 564.0, 1.7730496453900708, 46.090633311170215, 1.154906360815603], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 425.0, 425, 425, 425.0, 425.0, 425.0, 425.0, 2.352941176470588, 41.955422794117645, 1.5326286764705883], "isController": false}, {"data": ["2.5 Select hpv", 321, 0, 0.0, 336.4080996884738, 235, 1257, 270.0, 615.0, 645.6999999999999, 966.3199999999988, 0.12499133627030524, 2.8057319783227643, 0.09325525479542306], "isController": false}, {"data": ["2.5 Select flu", 333, 0, 0.0, 329.7357357357359, 234, 1245, 267.0, 603.6, 645.6, 883.4600000000032, 0.12764009938295787, 2.9585359621907408, 0.09523148039900371], "isController": false}, {"data": ["5.1 Consent start", 2, 0, 0.0, 646.5, 551, 742, 646.5, 742.0, 742.0, 742.0, 0.008953553441522103, 0.10659887381085618, 0.019043788472299945], "isController": false}, {"data": ["5.5 Consent agree", 2, 0, 0.0, 720.0, 712, 728, 720.0, 728.0, 728.0, 728.0, 0.00909338910611985, 0.14446411521323999, 0.013977533645539693], "isController": false}, {"data": ["Debug Sampler", 1853, 0, 0.0, 0.6368051807879113, 0, 12, 1.0, 1.0, 1.0, 1.0, 0.6847743219607089, 6.056168510978007, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 71, 0, 0.0, 314.9859154929577, 255, 1230, 283.0, 381.5999999999999, 504.59999999999854, 1230.0, 0.04040049982815562, 0.9256606708673702, 0.024175062514083273], "isController": false}, {"data": ["4.2 Vaccination batch", 1050, 0, 0.0, 464.9961904761899, 364, 1570, 409.0, 643.8, 715.3499999999998, 1004.96, 0.38442739539455983, 5.467203995482063, 0.6218663732661867], "isController": false}, {"data": ["5.0 Consent for hpv", 1, 1, 100.0, 5356.0, 5356, 5356, 5356.0, 5356.0, 5356.0, 5356.0, 0.18670649738610906, 30.43352373506348, 2.7756181735436893], "isController": true}, {"data": ["5.7 Consent triage", 2, 0, 0.0, 402.5, 402, 403, 402.5, 403.0, 403.0, 403.0, 0.008803281863478705, 0.1383851837465007, 0.014528853856717785], "isController": false}, {"data": ["5.0 Consent for flu", 1, 1, 100.0, 5138.0, 5138, 5138, 5138.0, 5138.0, 5138.0, 5138.0, 0.19462826002335537, 32.7357510826197, 2.895665567827949], "isController": true}, {"data": ["2.2 Session register", 999, 0, 0.0, 505.9679679679678, 259, 2024, 434.0, 775.0, 1003.0, 1425.0, 0.3823790252664883, 15.22940522693755, 0.2544038926538827], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 134.0, 134, 134, 134.0, 134.0, 134.0, 134.0, 7.462686567164179, 0.0, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 2, 100.0, 0.015319800842589047], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 13055, 2, "Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["5.8 Consent confirm", 2, 2, "Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
