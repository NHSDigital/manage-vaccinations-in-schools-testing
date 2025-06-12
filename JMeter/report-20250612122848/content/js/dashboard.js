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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6494360902255639, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.8785714285714286, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.38, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.22435897435897437, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.30412371134020616, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.65, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.34, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9096774193548387, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.49645390070921985, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9253731343283582, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.8986928104575164, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.971875, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.5, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.9925373134328358, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.04285714285714286, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [0.9694656488549618, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.0392156862745098, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.8247422680412371, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.7985074626865671, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9246575342465754, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8954248366013072, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8432835820895522, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.355, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.5671641791044776, 500, 1500, "5.1 Consent homepage"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2646, 0, 0.0, 598.3609221466348, 0, 4913, 398.0, 1117.0, 1573.0, 2738.200000000008, 4.425748287656912, 111.40839434905874, 5.356241911321954], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 100, 0, 0.0, 5877.610000000001, 2657, 10057, 5663.0, 8286.300000000001, 9365.099999999999, 10053.499999999998, 0.254600633446376, 51.81883211666056, 1.082216790211624], "isController": true}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 486.0857142857141, 330, 2177, 357.5, 837.4999999999999, 1126.4000000000005, 2177.0, 1.0282172182317602, 14.773593683441298, 1.486095198225591], "isController": false}, {"data": ["2.3 Search by first/last name", 100, 0, 0.0, 1266.0699999999997, 649, 4040, 1013.0, 2442.7000000000003, 2792.0499999999993, 4034.009999999997, 0.25465444664862014, 9.180882187462597, 0.21955739386002662], "isController": false}, {"data": ["5.8 Consent confirm", 67, 0, 0.0, 892.9850746268656, 762, 1365, 836.0, 1159.6, 1227.6, 1365.0, 0.24795254114346832, 21.05297704380433, 0.5387640664494306], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 118.54285714285714, 110, 166, 118.0, 121.0, 134.0, 166.0, 1.1776581426648722, 7.097000389047779, 0.7095850332267833], "isController": false}, {"data": ["3.0 Nurse triage", 156, 0, 0.0, 1524.4423076923078, 1017, 2726, 1521.0, 1827.9, 1972.15, 2517.3800000000024, 0.3342947880013886, 39.74982334341932, 0.9974559242500868], "isController": true}, {"data": ["2.4 Patient attending session", 97, 0, 0.0, 1590.7216494845366, 844, 4913, 1248.0, 2798.2000000000007, 3522.099999999997, 4913.0, 0.24525420471899428, 8.278912124565117, 0.36452822224834897], "isController": false}, {"data": ["5.4 Consent route", 67, 0, 0.0, 374.76119402985086, 345, 438, 371.0, 393.6, 412.4, 438.0, 0.2503736920777279, 2.859291795123318, 0.3894973549607623], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 353.47142857142853, 329, 630, 348.0, 361.0, 385.6500000000001, 630.0, 1.1869436201780414, 6.125973664688427, 0.6433141691394658], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 791.6142857142855, 448, 2969, 513.5, 1617.1, 2129.1000000000013, 2969.0, 1.0366837966322586, 10.060084850717534, 1.63095468395954], "isController": false}, {"data": ["2.1 Open session", 100, 0, 0.0, 1363.5399999999997, 583, 3738, 1183.5, 2134.6, 2642.4999999999986, 3734.9499999999985, 0.2544652285988381, 4.294162857905344, 0.15851891535468637], "isController": false}, {"data": ["3.3 Nurse triage complete", 155, 0, 0.0, 350.8322580645163, 250, 786, 295.0, 610.4, 636.2, 749.0399999999998, 0.33798517226341035, 8.212558431912342, 0.22889807293938072], "isController": false}, {"data": ["4.3 Vaccination confirm", 141, 0, 0.0, 933.7872340425529, 713, 1627, 855.0, 1153.8, 1196.9, 1531.240000000003, 0.39450711791565946, 9.878066523413018, 0.9181285376236682], "isController": false}, {"data": ["5.6 Consent questions", 67, 0, 0.0, 418.1940298507463, 344, 703, 384.0, 604.0, 618.0, 703.0, 0.2472306477442971, 2.980090005101438, 0.47949225236345117], "isController": false}, {"data": ["4.1 Vaccination questions", 153, 0, 0.0, 441.48366013071904, 357, 679, 398.0, 615.6, 635.1999999999999, 675.76, 0.37230534878684424, 4.332436396315394, 0.7537477103525221], "isController": false}, {"data": ["5.3 Consent parent details", 67, 0, 0.0, 378.2388059701494, 349, 492, 372.0, 403.4, 427.7999999999999, 492.0, 0.2509222328333614, 2.84780349418572, 0.4166505744059323], "isController": false}, {"data": ["3.1 Nurse triage new", 160, 0, 0.0, 284.9, 218, 1123, 243.0, 422.1, 514.8499999999999, 902.7899999999951, 0.33236670018030895, 3.7455459129541997, 0.22901331492160298], "isController": false}, {"data": ["3.2 Nurse triage result", 156, 0, 0.0, 889.7115384615387, 500, 1654, 972.5, 1087.7, 1160.1000000000001, 1433.4100000000026, 0.332590689592683, 27.769546615330086, 0.5394230231107889], "isController": false}, {"data": ["5.2 Consent who", 67, 0, 0.0, 398.4477611940299, 363, 719, 391.0, 418.0, 427.0, 719.0, 0.2491984735663649, 3.7387471314280187, 0.3879124676413922], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 2234.542857142857, 1469, 4827, 1822.0, 3742.2999999999997, 4185.950000000002, 4827.0, 1.1334196891191708, 52.236922664345855, 5.395918930132773], "isController": true}, {"data": ["5.0 Consent", 67, 0, 0.0, 4390.582089552238, 3899, 4809, 4389.0, 4662.6, 4740.4, 4809.0, 0.24837168266254445, 51.05998755361306, 3.705668000506011], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page", 131, 0, 0.0, 311.6641221374047, 249, 642, 292.0, 349.5999999999999, 599.1999999999999, 638.1600000000001, 0.3803727653100038, 8.606520775140172, 0.27483905840318934], "isController": false}, {"data": ["4.0 Vaccination", 153, 0, 0.0, 1741.2026143790847, 755, 2812, 1792.0, 1997.2, 2104.4999999999995, 2714.2600000000016, 0.3410481546619945, 17.78495205473154, 1.9660575411486858], "isController": true}, {"data": ["2.5 Patient return to consent page", 97, 0, 0.0, 487.4432989690722, 256, 3482, 333.0, 771.4000000000001, 1040.5999999999995, 3482.0, 0.2448209021524048, 5.594663385456628, 0.16974886770332753], "isController": false}, {"data": ["5.5 Consent agree", 67, 0, 0.0, 519.3432835820894, 354, 811, 400.0, 729.0, 748.5999999999999, 811.0, 0.24740867112002274, 4.306742065151565, 0.38029418783487867], "isController": false}, {"data": ["Debug Sampler", 141, 0, 0.0, 0.2695035460992909, 0, 1, 0.0, 1.0, 1.0, 1.0, 0.3954642217067787, 1.5878798936944492, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 146, 0, 0.0, 358.5068493150684, 214, 2103, 238.0, 767.8000000000002, 1157.7000000000003, 1913.5900000000004, 0.3261855504269456, 3.53197791321677, 0.20373506193057161], "isController": false}, {"data": ["4.2 Vaccination batch", 153, 0, 0.0, 439.16993464052314, 352, 1373, 387.0, 604.2, 618.0, 1135.9400000000035, 0.37882726962102414, 6.6052226205995375, 0.6044039753341356], "isController": false}, {"data": ["5.7 Consent triage", 67, 0, 0.0, 515.7761194029852, 378, 812, 423.0, 743.4, 777.1999999999999, 812.0, 0.24609100959754937, 4.024775992903764, 0.4066125939828912], "isController": false}, {"data": ["2.2 Session register", 100, 0, 0.0, 1224.7000000000007, 513, 4418, 932.0, 2309.9000000000005, 2860.1999999999975, 4406.8299999999945, 0.2546349934686124, 24.283825652852293, 0.1608626731199662], "isController": false}, {"data": ["5.1 Consent homepage", 67, 0, 0.0, 612.7014925373135, 484, 857, 547.0, 761.2, 798.4, 857.0, 0.2503914702463927, 3.157798187745019, 0.5333044888743969], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2646, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
