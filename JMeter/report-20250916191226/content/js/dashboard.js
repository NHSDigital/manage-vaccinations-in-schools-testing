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

    var data = {"OkPercent": 99.97710098465765, "KoPercent": 0.02289901534234028};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6372349504365522, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9171528588098017, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.845771144278607, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.7992992992992993, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8015075376884422, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.9931506849315068, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.4332552693208431, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "6.1 Logout"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9794520547945206, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4863013698630137, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.12162162162162163, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.38509021842355173, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.603988603988604, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.6666666666666666, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.8333333333333334, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [0.5, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.5, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.9174454828660437, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9029850746268657, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9931506849315068, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8580246913580247, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.6666666666666666, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.6271271271271271, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 13101, 3, 0.02289901534234028, 582.6933821845668, 0, 4596, 419.0, 1445.0, 1850.0, 2670.959999999999, 4.415473063288784, 91.22332367069438, 3.8639266503087564], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 2, 2, 100.0, 5929.5, 5019, 6840, 5929.5, 6840.0, 6840.0, 6840.0, 0.004399946320654888, 0.7627826862387279, 0.06544920151974146], "isController": true}, {"data": ["2.0 Register attendance", 999, 0, 0.0, 4382.909909909907, 1885, 8552, 4291.0, 5609.0, 6051.0, 6972.0, 0.37416220811883305, 69.30673460665683, 1.4862565350809842], "isController": true}, {"data": ["2.5 Select patient", 857, 0, 0.0, 381.688448074679, 261, 2359, 291.0, 651.0, 756.5999999999985, 1520.2599999999998, 0.32251581908104443, 7.407853944058935, 0.22422980237626797], "isController": false}, {"data": ["Choose session", 999, 0, 0.0, 0.17117117117117125, 0, 41, 0.0, 1.0, 1.0, 1.0, 0.37479839110568525, 0.0, 0.0], "isController": false}, {"data": ["2.5 Select menacwy", 201, 0, 0.0, 436.3333333333334, 261, 1648, 307.0, 690.8, 804.5999999999995, 1303.9599999999996, 0.07646629833497488, 1.7939305511726926, 0.057349723751231166], "isController": false}, {"data": ["2.3 Search by first/last name", 999, 0, 0.0, 546.6706706706702, 341, 2987, 442.0, 852.0, 1015.0, 1599.0, 0.37545014555739875, 17.17630390941692, 0.29348374902661073], "isController": false}, {"data": ["2.5 Select td_ipv", 199, 0, 0.0, 485.0954773869346, 268, 2869, 335.0, 705.0, 824.0, 2636.0, 0.07566266617745747, 1.8663937875818175, 0.05275697622139125], "isController": false}, {"data": ["4.0 Vaccination for flu", 335, 0, 0.0, 2516.7313432835813, 1951, 5083, 2346.0, 3287.6000000000004, 3636.5999999999995, 4441.239999999995, 0.12655578616832144, 5.779167909400413, 0.7639326203536082], "isController": true}, {"data": ["4.0 Vaccination for hpv", 320, 0, 0.0, 2519.0625000000005, 1941, 4809, 2312.0, 3237.4, 3998.7999999999997, 4435.620000000002, 0.12092638681781456, 5.262559291719037, 0.7327567770264807], "isController": true}, {"data": ["5.8 Consent confirm", 3, 3, 100.0, 1635.6666666666667, 1444, 2018, 1445.0, 2018.0, 2018.0, 2018.0, 0.0025030662561638006, 0.19731690852544367, 0.005441235826387325], "isController": false}, {"data": ["1.2 Sign-in page", 73, 0, 0.0, 145.068493150685, 126, 501, 132.0, 142.20000000000005, 237.49999999999932, 501.0, 0.0273761669091145, 0.18464263601736025, 0.017388070268057675], "isController": false}, {"data": ["Get correct patient name", 999, 0, 0.0, 0.30430430430430494, 0, 44, 0.0, 1.0, 1.0, 1.0, 0.37558664265017544, 0.0, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 854, 0, 0.0, 1147.1569086651054, 774, 3718, 981.5, 1645.5, 1980.25, 3046.3000000000025, 0.32136493547300665, 15.091326709885358, 0.4782814078719357], "isController": false}, {"data": ["6.1 Logout", 4, 0, 0.0, 131.5, 129, 137, 130.0, 137.0, 137.0, 137.0, 0.016510504808684524, 0.0788441098774095, 0.012108778429025467], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 130.0, 130, 130, 130.0, 130.0, 130.0, 130.0, 7.6923076923076925, 36.73377403846154, 5.618990384615384], "isController": false}, {"data": ["5.4 Consent route", 3, 0, 0.0, 394.6666666666667, 375, 418, 391.0, 418.0, 418.0, 418.0, 0.0025148312171028643, 0.026977131487111908, 0.003912232547700061], "isController": false}, {"data": ["1.1 Homepage", 73, 0, 0.0, 403.12328767123284, 374, 699, 396.0, 421.8, 481.8999999999998, 699.0, 0.02737051123615727, 0.173377938088466, 0.015786595568639244], "isController": false}, {"data": ["1.3 Sign-in", 73, 0, 0.0, 830.6849315068494, 705, 1989, 759.0, 1026.6000000000004, 1249.7999999999997, 1989.0, 0.027356069599836913, 0.4179826066221549, 0.05993691720797958], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 199, 0, 0.0, 2574.8994974874363, 1991, 5091, 2374.0, 3296.0, 3813.0, 4316.0, 0.07561201083493518, 3.6575499495223336, 0.45918704870268406], "isController": true}, {"data": ["2.1 Open session", 999, 0, 0.0, 1870.0620620620634, 1060, 4596, 1769.0, 2552.0, 2928.0, 3495.0, 0.3749179515143645, 6.1430670067558415, 0.24614472391177156], "isController": false}, {"data": ["4.3 Vaccination confirm", 1053, 0, 0.0, 1331.9259259259259, 898, 4173, 1195.0, 1893.8000000000002, 2195.699999999999, 3125.3600000000006, 0.37871649276158775, 7.653538905342097, 0.881768877335778], "isController": false}, {"data": ["5.6 Consent questions", 3, 0, 0.0, 431.0, 399, 479, 415.0, 479.0, 479.0, 479.0, 0.0025107522967106636, 0.02884504583587547, 0.006186160199805667], "isController": false}, {"data": ["4.1 Vaccination questions", 1053, 0, 0.0, 678.9145299145299, 391, 3918, 657.0, 881.6, 1105.3, 1962.7000000000035, 0.37977696668926814, 4.333990418904273, 0.801067736697888], "isController": false}, {"data": ["5.3 Consent parent details", 3, 0, 0.0, 740.3333333333334, 384, 1175, 662.0, 1175.0, 1175.0, 1175.0, 0.002514462349278936, 0.026795557919382984, 0.004542729830240265], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 3, 0, 0.0, 753.6666666666666, 434, 1393, 434.0, 1393.0, 1393.0, 1393.0, 0.0025106871583373226, 0.035993871464952476, 0.0039082376273336834], "isController": false}, {"data": ["1.0 Login", 73, 0, 0.0, 1726.739726027397, 1534, 2864, 1630.0, 2023.600000000001, 2411.7999999999997, 2864.0, 0.02734855736359907, 1.4022029608325577, 0.10946813260865901], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 199, 0, 0.0, 2572.0804020100522, 1989, 6477, 2322.0, 3480.0, 3958.0, 5185.0, 0.07565274250695701, 3.5827682197417543, 0.45865626033572326], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 751.0, 751, 751, 751.0, 751.0, 751.0, 751.0, 1.3315579227696406, 34.61270389480693, 0.867333139147803], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 637.0, 637, 637, 637.0, 637.0, 637.0, 637.0, 1.5698587127158556, 27.99376962323391, 1.0225544544740972], "isController": false}, {"data": ["2.5 Select hpv", 321, 0, 0.0, 374.8130841121494, 262, 2141, 290.0, 649.6, 701.5999999999997, 1302.78, 0.12138891609530052, 2.7227054830021484, 0.09056751161797812], "isController": false}, {"data": ["2.5 Select flu", 335, 0, 0.0, 387.87462686567176, 261, 1544, 294.0, 665.8000000000001, 782.5999999999998, 1422.0399999999972, 0.12664171131889593, 2.936936984856487, 0.09448658930433251], "isController": false}, {"data": ["5.1 Consent start", 3, 0, 0.0, 1285.0, 778, 2299, 778.0, 2299.0, 2299.0, 2299.0, 0.002514850190374159, 0.029983366885626292, 0.005355517560360596], "isController": false}, {"data": ["5.5 Consent agree", 3, 0, 0.0, 470.0, 399, 609, 402.0, 609.0, 609.0, 609.0, 0.0025087324796395456, 0.040719537402274415, 0.0038561962138209415], "isController": false}, {"data": ["Debug Sampler", 1857, 0, 0.0, 0.8508346795907369, 0, 9, 1.0, 1.0, 2.0, 2.0, 0.6740574629449886, 7.82413385476294, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 73, 0, 0.0, 347.86301369863, 311, 972, 332.0, 387.0, 403.3, 972.0, 0.02738440311942113, 0.6274611820224394, 0.01642470721665302], "isController": false}, {"data": ["4.2 Vaccination batch", 1053, 0, 0.0, 528.0522317188983, 390, 2752, 433.0, 726.4000000000002, 973.0999999999997, 1906.1400000000003, 0.37952483346680976, 5.398102554917568, 0.6139395080936464], "isController": false}, {"data": ["5.0 Consent for hpv", 1, 1, 100.0, 7457.0, 7457, 7457, 7457.0, 7457.0, 7457.0, 7457.0, 0.1341021858656296, 21.855644235282284, 1.993329463926512], "isController": true}, {"data": ["5.7 Consent triage", 3, 0, 0.0, 725.3333333333334, 482, 858, 836.0, 858.0, 858.0, 858.0, 0.0025061986646973513, 0.039367388204743066, 0.004130496041459209], "isController": false}, {"data": ["2.2 Session register", 999, 0, 0.0, 656.6666666666673, 329, 2462, 556.0, 961.0, 1190.0, 1834.0, 0.3748635069062691, 18.795345257169874, 0.249403678207447], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 110.0, 110, 110, 110.0, 110.0, 110.0, 110.0, 9.09090909090909, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 3, 100.0, 0.02289901534234028], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 13101, 3, "Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 3, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["5.8 Consent confirm", 3, 3, "Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
