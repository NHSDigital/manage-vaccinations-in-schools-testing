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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6902554525445208, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.012512512512512513, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9480676328502415, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.8427835051546392, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.8468468468468469, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8221649484536082, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.16666666666666666, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.9931506849315068, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [1.0, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.47158403869407495, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "6.1 Logout"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9726027397260274, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5205205205205206, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4525440313111546, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.6306262230919765, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [1.0, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [0.5, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.5, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.9290322580645162, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9475308641975309, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.928082191780822, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.7492492492492493, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 12892, 0, 0.0, 433.5342072603164, 0, 8659, 352.5, 941.0, 1185.0, 1776.4199999999983, 4.476659353724843, 102.60031803190974, 3.887183838863008], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 1, 0, 0.0, 4489.0, 4489, 4489, 4489.0, 4489.0, 4489.0, 4489.0, 0.22276676319893074, 44.04538350690577, 3.4826885859879706], "isController": true}, {"data": ["2.0 Register attendance", 999, 0, 0.0, 2971.1581581581545, 1101, 10945, 2917.0, 3824.0, 4415.0, 5779.0, 0.3871333761673098, 81.74825340395934, 1.5149141746570247], "isController": true}, {"data": ["2.5 Select patient", 828, 0, 0.0, 276.252415458937, 171, 5245, 216.0, 523.2, 614.55, 932.5200000000004, 0.32181597489835395, 7.375479286691783, 0.22374293306888457], "isController": false}, {"data": ["Choose session", 999, 0, 0.0, 0.17517517517517522, 0, 42, 0.0, 1.0, 1.0, 1.0, 0.387563818066138, 0.0, 0.0], "isController": false}, {"data": ["2.5 Select menacwy", 194, 0, 0.0, 351.93298969072174, 176, 1114, 225.5, 622.5, 641.25, 905.9500000000025, 0.07634242647712758, 1.78814810022462, 0.057256819857845684], "isController": false}, {"data": ["2.3 Search by first/last name", 999, 0, 0.0, 485.4534534534527, 287, 2529, 381.0, 843.0, 929.0, 1559.0, 0.3879521253873696, 21.391734182286044, 0.3032719079846683], "isController": false}, {"data": ["2.5 Select td_ipv", 194, 0, 0.0, 393.396907216495, 183, 1568, 228.5, 654.0, 827.25, 1438.8000000000015, 0.0764957984485548, 1.8758228720071513, 0.05333789071510559], "isController": false}, {"data": ["4.0 Vaccination for flu", 324, 0, 0.0, 2047.009259259259, 1665, 5626, 1904.5, 2502.0, 3012.0, 4213.75, 0.1269320905480254, 5.780748310338971, 0.7662053549916437], "isController": true}, {"data": ["4.0 Vaccination for hpv", 310, 0, 0.0, 2065.7129032258076, 1640, 6185, 1931.0, 2528.5, 2820.7, 4146.5099999999975, 0.12107005621165545, 5.257333702710914, 0.7336096346476724], "isController": true}, {"data": ["5.8 Consent confirm", 3, 0, 0.0, 1588.3333333333333, 1038, 2179, 1548.0, 2179.0, 2179.0, 2179.0, 0.01476268976207465, 1.1642677936545038, 0.03234624504834781], "isController": false}, {"data": ["1.2 Sign-in page", 73, 0, 0.0, 167.75342465753425, 135, 1101, 145.0, 169.00000000000006, 249.7999999999996, 1101.0, 0.0283424152008526, 0.2148661579186961, 0.018054867688481916], "isController": false}, {"data": ["Get correct patient name", 999, 0, 0.0, 0.2742742742742745, 0, 47, 0.0, 1.0, 1.0, 1.0, 0.38801646681293994, 0.0, 0.0], "isController": false}, {"data": ["5.9 Patient home page", 3, 0, 0.0, 228.33333333333334, 188, 256, 241.0, 256.0, 256.0, 256.0, 0.01462822369479674, 0.3670341322171999, 0.010947358813260973], "isController": false}, {"data": ["2.4 Patient attending session", 827, 0, 0.0, 935.6602176541711, 636, 8659, 795.0, 1277.6000000000001, 1600.1999999999994, 2702.200000000003, 0.32125225449549216, 18.19074275526638, 0.47811370688586924], "isController": false}, {"data": ["6.1 Logout", 2, 0, 0.0, 154.0, 151, 157, 154.0, 157.0, 157.0, 157.0, 0.02637548135253468, 0.1253350510365564, 0.019343736812259323], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 226.0, 226, 226, 226.0, 226.0, 226.0, 226.0, 4.424778761061947, 21.06955199115044, 3.232162610619469], "isController": false}, {"data": ["5.4 Consent route", 3, 0, 0.0, 324.3333333333333, 311, 339, 323.0, 339.0, 339.0, 339.0, 0.014837088765356388, 0.16701384424024215, 0.023337504203841817], "isController": false}, {"data": ["1.1 Homepage", 73, 0, 0.0, 443.15068493150693, 321, 1466, 421.0, 468.20000000000005, 512.4, 1466.0, 0.028348391636525465, 0.2032876088500572, 0.01640370398434703], "isController": false}, {"data": ["1.3 Sign-in", 73, 0, 0.0, 786.8082191780823, 441, 1565, 726.0, 1013.0000000000005, 1203.1999999999991, 1565.0, 0.028321160407172936, 0.4563339414461948, 0.06210446456421494], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 194, 0, 0.0, 2175.6443298969057, 1692, 5190, 1963.0, 2880.0, 3485.0, 4652.300000000007, 0.07645549186891903, 3.6895316864662746, 0.46432694572822675], "isController": true}, {"data": ["2.1 Open session", 999, 0, 0.0, 883.1921921921929, 428, 5531, 872.0, 1304.0, 1544.0, 2166.0, 0.38764427526235834, 6.2553282444108795, 0.25449993185182596], "isController": false}, {"data": ["4.3 Vaccination confirm", 1022, 0, 0.0, 1081.6379647749504, 725, 4537, 930.5, 1473.5000000000002, 1805.0999999999995, 2829.6299999999997, 0.38251323170158874, 7.706712792588002, 0.8906234151619712], "isController": false}, {"data": ["5.6 Consent questions", 3, 0, 0.0, 334.3333333333333, 323, 345, 335.0, 345.0, 345.0, 345.0, 0.0146948612070359, 0.16960797324800517, 0.0364597109765715], "isController": false}, {"data": ["4.1 Vaccination questions", 1022, 0, 0.0, 586.9481409001966, 314, 3023, 609.0, 708.7, 842.5999999999985, 1515.1399999999985, 0.38383260992278656, 4.370944972905436, 0.8096956916526548], "isController": false}, {"data": ["5.3 Consent parent details", 3, 0, 0.0, 333.3333333333333, 321, 352, 327.0, 352.0, 352.0, 352.0, 0.014755211048702034, 0.15690380186456682, 0.027017598355777647], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 3, 0, 0.0, 357.3333333333333, 340, 372, 360.0, 372.0, 372.0, 372.0, 0.014792972351934674, 0.2118688794076894, 0.023282559023959683], "isController": false}, {"data": ["1.0 Login", 73, 0, 0.0, 1982.6027397260277, 1764, 2898, 1886.0, 2305.2000000000003, 2623.5999999999995, 2898.0, 0.028330096070072357, 1.5229048705450439, 0.11355611469225949], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 194, 0, 0.0, 2097.845360824742, 1678, 5350, 1955.5, 2544.5, 3006.75, 4216.650000000013, 0.07629889028376895, 3.602193990690552, 0.46260695917163785], "isController": true}, {"data": ["5.0 Consent for td_ipv", 1, 0, 0.0, 5932.0, 5932, 5932, 5932.0, 5932.0, 5932.0, 5932.0, 0.16857720836142953, 33.52463992961901, 2.7048081380647333], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 769.0, 769, 769, 769.0, 769.0, 769.0, 769.0, 1.3003901170351106, 33.78093506176853, 0.8470314531859557], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 627.0, 627, 627, 627.0, 627.0, 627.0, 627.0, 1.594896331738437, 28.413763456937797, 1.0388631379585327], "isController": false}, {"data": ["2.5 Select hpv", 310, 0, 0.0, 296.6258064516131, 177, 2391, 214.0, 595.0, 631.3499999999999, 1403.1099999999988, 0.12118823895506028, 2.7167254356326263, 0.090417787657877], "isController": false}, {"data": ["2.5 Select flu", 324, 0, 0.0, 276.55555555555577, 169, 1680, 215.0, 576.0, 635.75, 793.75, 0.12699373301605804, 2.9329827626095177, 0.09474923049244957], "isController": false}, {"data": ["5.1 Consent start", 3, 0, 0.0, 817.6666666666666, 785, 861, 807.0, 861.0, 861.0, 861.0, 0.014773740169307064, 0.17606335533799855, 0.03171160243372747], "isController": false}, {"data": ["5.5 Consent agree", 3, 0, 0.0, 587.0, 348, 989, 424.0, 989.0, 989.0, 989.0, 0.014887229238518224, 0.24856148270600206, 0.023140143103491058], "isController": false}, {"data": ["Debug Sampler", 1828, 0, 0.0, 1.0229759299781216, 0, 13, 1.0, 2.0, 2.0, 2.0, 0.6834567207013732, 8.975009031008483, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 75, 0, 0.0, 584.7066666666665, 537, 1049, 563.0, 639.6000000000001, 768.0, 1049.0, 0.02909002898530488, 0.6658908386238399, 0.017486213386804686], "isController": false}, {"data": ["4.2 Vaccination batch", 1022, 0, 0.0, 418.16438356164383, 317, 4799, 357.0, 597.7, 654.0999999999995, 1218.0, 0.38385149529312435, 5.449419733887064, 0.6208984850354256], "isController": false}, {"data": ["5.7 Consent triage", 3, 0, 0.0, 540.3333333333334, 384, 782, 455.0, 782.0, 782.0, 782.0, 0.014815326949573566, 0.2350727478851121, 0.024716325070496266], "isController": false}, {"data": ["5.0 Consent for flu", 1, 0, 0.0, 4912.0, 4912, 4912, 4912.0, 4912.0, 4912.0, 4912.0, 0.20358306188925082, 39.08516452056189, 3.1807865304356677], "isController": true}, {"data": ["2.2 Session register", 999, 0, 0.0, 596.2662662662646, 292, 3354, 497.0, 921.0, 1071.0, 1512.0, 0.3876274291221888, 23.04560326422358, 0.2578957535638248], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 138.0, 138, 138, 138.0, 138.0, 138.0, 138.0, 7.246376811594203, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 12892, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
