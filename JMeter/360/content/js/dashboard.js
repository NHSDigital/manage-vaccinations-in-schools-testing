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

    var data = {"OkPercent": 99.97177333991955, "KoPercent": 0.02822666008044598};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7048702285856436, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4766441303011678, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9981515711645101, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.4119318181818182, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9993861264579497, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5024570024570024, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5024691358024691, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7016592214422464, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4966887417218543, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.34394904458598724, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.9097664543524416, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.6985364301622653, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7012156110044786, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.3564189189189189, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5050632911392405, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9650735294117647, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.6506024096385542, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9975046787273861, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.304729945669543, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5025380710659898, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.38274932614555257, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.34, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.26013513513513514, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7180428134556575, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.995627732667083, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.996319018404908, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9752747252747253, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.30368098159509205, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 28342, 8, 0.02822666008044598, 778.6742290593533, 0, 27113, 218.0, 2414.7000000000044, 4994.550000000021, 7116.970000000005, 7.5275277189482175, 389.5884021228341, 58.763348740901336], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1627, 8, 0.49170251997541486, 1037.4855562384744, 467, 2215, 1015.0, 1354.2, 1481.3999999999992, 1744.0800000000004, 0.45560727381073063, 69.58620854624876, 16.736656829887668], "isController": true}, {"data": ["2.5 Select patient", 1623, 0, 0.0, 122.65619223659883, 73, 707, 101.0, 194.60000000000014, 261.39999999999986, 379.79999999999995, 0.45673254158855126, 11.923608156035229, 3.293794095585144], "isController": false}, {"data": ["7.1 Full name search", 176, 0, 0.0, 2791.3295454545455, 251, 18855, 917.5, 9240.000000000004, 12136.100000000002, 18270.569999999992, 0.050021571802839976, 1.9398130402898182, 0.36914168080865556], "isController": false}, {"data": ["2.3 Search by first/last name", 1629, 0, 0.0, 116.76243093922655, 76, 787, 97.0, 177.0, 229.5, 330.10000000000014, 0.45584169952560566, 14.242355108921402, 3.408799289545247], "isController": false}, {"data": ["4.0 Vaccination for flu", 407, 0, 0.0, 864.9410319410326, 242, 2144, 835.0, 1114.9999999999998, 1222.1999999999996, 1608.6400000000026, 0.11614057175404223, 6.096890115930834, 3.2956314023560274], "isController": true}, {"data": ["4.0 Vaccination for hpv", 405, 0, 0.0, 852.6197530864202, 192, 1704, 809.0, 1111.4, 1220.0, 1498.58, 0.11626434895840061, 5.678415899052833, 3.3018239678453], "isController": true}, {"data": ["1.2 Sign-in page", 3134, 0, 0.0, 1180.4604339502246, 13, 19077, 219.0, 4115.0, 5707.75, 9060.300000000007, 0.8686016843223217, 57.40056594568662, 7.530346061138029], "isController": false}, {"data": ["7.7 Due vaccination search", 151, 0, 0.0, 804.8013245033114, 616, 7182, 725.0, 941.6000000000003, 1010.0000000000002, 4063.5599999999386, 0.043184968656578546, 5.784327208306986, 0.32709156144620455], "isController": false}, {"data": ["7.2 First name search", 157, 0, 0.0, 2470.5987261146497, 369, 18743, 815.0, 7146.200000000001, 8911.599999999999, 13924.359999999895, 0.047809546256954084, 6.481709467915532, 0.3524574182905925], "isController": false}, {"data": ["2.4 Patient attending session", 1413, 8, 0.5661712668082095, 428.40622788393506, 79, 1619, 387.0, 577.6000000000001, 696.0, 898.0199999999993, 0.39693296945470175, 12.834590402589896, 3.480762454368861], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 23.0, 23, 23, 23.0, 23.0, 23.0, 23.0, 43.47826086956522, 13.629415760869566, 25.64538043478261], "isController": false}, {"data": ["1.1 Homepage", 3143, 0, 0.0, 1179.4384346166062, 29, 19599, 225.0, 4092.9999999999986, 5767.0, 8879.4, 0.8710101334255611, 67.95819281479339, 7.538623567651825], "isController": false}, {"data": ["1.3 Sign-in", 3126, 0, 0.0, 1183.2914267434433, 70, 19175, 248.5, 4022.0000000000073, 5705.899999999998, 8737.870000000006, 0.8703409197214909, 57.733986321329816, 7.792452400533759], "isController": false}, {"data": ["Run some searches", 1480, 0, 0.0, 2427.561486486486, 0, 27113, 1228.5, 5782.9, 6385.75, 12087.910000000005, 0.4139750132513961, 48.281841166545924, 3.098175155572789], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 395, 0, 0.0, 870.9417721518985, 204, 2242, 837.0, 1091.8000000000002, 1215.9999999999998, 1469.5200000000002, 0.1139593248876491, 5.660725763754674, 3.2366042932300374], "isController": true}, {"data": ["2.1 Open session", 1632, 0, 0.0, 290.9810049019609, 126, 1107, 258.0, 462.4000000000001, 537.3499999999999, 714.090000000002, 0.45564102857611904, 10.192963777114063, 3.2893604347379384], "isController": false}, {"data": ["4.3 Vaccination confirm", 1577, 0, 0.0, 587.7121116043124, 393, 2437, 544.0, 772.0, 897.1999999999998, 1149.8600000000004, 0.45363045312993505, 9.682500280282925, 4.675689778256114], "isController": false}, {"data": ["4.1 Vaccination questions", 1603, 0, 0.0, 146.58203368683718, 83, 732, 118.0, 233.0, 302.0, 448.8000000000002, 0.45605226592256837, 6.372177638723247, 4.276004536553599], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 23.0, 23, 23, 23.0, 23.0, 23.0, 23.0, 43.47826086956522, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3129, 0, 0.0, 3797.001278363697, 294, 56045, 1069.0, 11426.0, 17190.5, 26631.89999999979, 0.8700311392736617, 220.63517852712613, 26.132249744659486], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 394, 0, 0.0, 882.7284263959393, 197, 2639, 838.5, 1141.0, 1282.0, 1571.7500000000007, 0.11382371710704023, 6.053141867721529, 3.2328964517622887], "isController": true}, {"data": ["7.0 Open Children Search", 1484, 0, 0.0, 2315.076145552559, 80, 18898, 1193.0, 5786.5, 6428.0, 11111.800000000023, 0.41350028267927, 47.05619344803717, 2.982243877465154], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 48.0, 48, 48, 48.0, 48.0, 48.0, 48.0, 20.833333333333332, 5.9814453125, 12.858072916666666], "isController": false}, {"data": ["7.8 Year group search", 159, 0, 0.0, 3072.6981132075475, 2754, 4513, 2993.0, 3391.0, 3826.0, 4213.000000000003, 0.047441840480839464, 6.547344625734602, 0.36115718798336965], "isController": false}, {"data": ["7.9 DOB search", 175, 0, 0.0, 1526.2628571428586, 1096, 6006, 1345.0, 2094.4, 2503.399999999999, 4318.80000000002, 0.04918645601747103, 6.757187842987698, 0.3706086924940063], "isController": false}, {"data": ["7.4 Partial name search", 148, 0, 0.0, 3161.885135135135, 258, 20525, 2090.0, 7116.8, 9738.349999999986, 19399.46999999998, 0.04365786862285383, 5.877917034231014, 0.3218324570847576], "isController": false}, {"data": ["Debug Sampler", 1629, 0, 0.0, 0.301411909146716, 0, 20, 0.0, 1.0, 1.0, 1.0, 0.45585713454193777, 2.625804332752062, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1635, 0, 0.0, 523.442201834862, 330, 1583, 526.0, 698.0, 771.0, 909.0, 0.4559712997440983, 37.6870966065835, 3.287860712341512], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 286.1328125, 614.2578125], "isController": false}, {"data": ["4.2 Vaccination batch", 1601, 0, 0.0, 142.16239850093677, 85, 765, 112.0, 237.0, 296.89999999999986, 445.96000000000004, 0.45568602805728037, 7.311190167282454, 4.040067244909039], "isController": false}, {"data": ["7.5 Needs Consent search", 168, 0, 0.0, 5853.874999999999, 5124, 27113, 5728.0, 6062.8, 6334.1, 12915.560000000047, 0.04957470509689937, 6.803596021943447, 0.37600721673441384], "isController": false}, {"data": ["2.2 Session register", 1630, 0, 0.0, 134.97484662576716, 75, 787, 97.0, 261.9000000000001, 323.4499999999998, 483.1400000000003, 0.4557705444165172, 17.87562756266076, 3.29429874738596], "isController": false}, {"data": ["7.6 Needs triage search", 182, 0, 0.0, 281.0494505494505, 185, 5306, 225.0, 324.70000000000005, 477.8999999999997, 1483.0199999999425, 0.05158345622194264, 3.7294738099526596, 0.3912169830451982], "isController": false}, {"data": ["7.3 Last name search", 163, 0, 0.0, 2048.4171779141097, 476, 10914, 897.0, 4761.799999999999, 5987.799999999997, 10608.719999999992, 0.04747901019954001, 6.452214922678393, 0.3500581408515812], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 100.0, 0.02822666008044598], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 28342, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1413, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
