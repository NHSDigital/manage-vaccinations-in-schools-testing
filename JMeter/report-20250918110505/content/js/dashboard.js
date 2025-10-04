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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6939221398305084, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.026026026026026026, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9460260972716489, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.8266331658291457, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.9094094094094094, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8241206030150754, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.003048780487804878, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9930555555555556, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.4607142857142857, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "6.1 Logout"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.47097097097097096, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.43234165067178504, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.6242802303262955, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.1736111111111111, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [0.5, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [1.0, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.9335443037974683, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9207317073170732, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9276315789473685, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8872360844529751, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8273273273273273, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 12987, 0, 0.0, 438.52452452452496, 0, 7422, 320.0, 984.0, 1309.5999999999985, 2493.359999999997, 4.5093859603130975, 79.9568610740764, 3.9275289416936086], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 999, 0, 0.0, 2912.7577577577595, 1019, 7927, 2714.0, 4188.0, 4930.0, 6173.0, 0.3873262508331004, 57.46505596130091, 1.5276755619720064], "isController": true}, {"data": ["2.5 Select patient", 843, 0, 0.0, 303.81850533807835, 170, 2146, 238.0, 498.60000000000014, 673.3999999999999, 1418.8799999999987, 0.3264641607799202, 7.500852874912913, 0.22697683694664225], "isController": false}, {"data": ["Choose session", 999, 0, 0.0, 0.16916916916916944, 0, 40, 0.0, 1.0, 1.0, 1.0, 0.38774162047275756, 0.0, 0.0], "isController": false}, {"data": ["2.5 Select menacwy", 199, 0, 0.0, 380.2814070351757, 174, 3017, 285.0, 577.0, 610.0, 1033.0, 0.07825206129299145, 1.8403661666841653, 0.058689045969743586], "isController": false}, {"data": ["2.3 Search by first/last name", 999, 0, 0.0, 377.8258258258258, 207, 3013, 290.0, 610.0, 760.0, 1439.0, 0.3868116958846953, 13.012244248475017, 0.3023365432605709], "isController": false}, {"data": ["2.5 Select td_ipv", 199, 0, 0.0, 391.708542713568, 181, 5010, 254.0, 588.0, 710.0, 2311.0, 0.07822330118840455, 1.9261198117609324, 0.05454241899269615], "isController": false}, {"data": ["4.0 Vaccination for flu", 328, 0, 0.0, 2232.1341463414633, 1482, 8164, 1907.5, 3401.800000000001, 4085.800000000001, 7133.13, 0.12696687364589634, 5.789964184357836, 0.7663375011757984], "isController": true}, {"data": ["4.0 Vaccination for hpv", 316, 0, 0.0, 2163.294303797471, 1505, 8209, 1906.0, 2968.6, 3842.549999999997, 6339.599999999995, 0.12341701084780848, 5.364463190315084, 0.7478288821679994], "isController": true}, {"data": ["1.2 Sign-in page", 72, 0, 0.0, 133.97222222222223, 104, 1471, 110.0, 119.0, 133.19999999999993, 1471.0, 0.028469446945406277, 0.1835253735922946, 0.017799196464687802], "isController": false}, {"data": ["Get correct patient name", 996, 0, 0.0, 0.27811244979919664, 0, 47, 0.0, 1.0, 1.0, 1.0, 0.38575286100038575, 0.0, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 840, 0, 0.0, 896.9904761904764, 485, 5432, 722.5, 1396.7999999999997, 1791.0999999999988, 3178.3200000000015, 0.3253817522039772, 11.533971325684666, 0.48425956089732536], "isController": false}, {"data": ["6.1 Logout", 6, 0, 0.0, 120.0, 112, 137, 114.0, 137.0, 137.0, 137.0, 0.024156826115139484, 0.1149808305519432, 0.017716578527802493], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 186.0, 186, 186, 186.0, 186.0, 186.0, 186.0, 5.376344086021506, 25.590137768817204, 3.9272513440860215], "isController": false}, {"data": ["1.1 Homepage", 72, 0, 0.0, 336.2500000000001, 311, 446, 328.5, 356.0, 392.9499999999998, 446.0, 0.028475977546691702, 0.17190563886646626, 0.01612086082385749], "isController": false}, {"data": ["1.3 Sign-in", 72, 0, 0.0, 767.0277777777775, 389, 6177, 658.0, 820.2, 1053.3999999999983, 6177.0, 0.02842227927731618, 0.4291337034841767, 0.062483293892486406], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 199, 0, 0.0, 2251.703517587941, 1527, 6647, 1928.0, 3155.0, 4300.0, 6389.0, 0.07819115182639207, 3.77620679042512, 0.47485691866450297], "isController": true}, {"data": ["2.1 Open session", 999, 0, 0.0, 1058.5225225225236, 386, 5456, 848.0, 1862.0, 2394.0, 3471.0, 0.3872265624242941, 6.250881595134085, 0.2542256910191733], "isController": false}, {"data": ["4.3 Vaccination confirm", 1042, 0, 0.0, 1154.7159309021117, 642, 7422, 978.5, 1658.8000000000002, 2301.8999999999987, 4324.199999999996, 0.38783536872461344, 7.827957686095842, 0.9029441204651271], "isController": false}, {"data": ["4.1 Vaccination questions", 1042, 0, 0.0, 595.2284069097891, 291, 6377, 541.0, 745.1000000000001, 1076.0999999999976, 2524.6099999999888, 0.3887990065849567, 4.432174509444421, 0.8201618934390354], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.0 Login", 72, 0, 0.0, 1673.7916666666667, 1422, 7164, 1528.0, 1832.8000000000002, 2174.1, 7164.0, 0.028447782317569708, 1.435996808193396, 0.11347280488318037], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 199, 0, 0.0, 2216.7788944723593, 1510, 8538, 1952.0, 3059.0, 3586.0, 5159.0, 0.07820393464037391, 3.6975084027475127, 0.47416162815384877], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 537.0, 537, 537, 537.0, 537.0, 537.0, 537.0, 1.86219739292365, 48.38439827746741, 1.2129742783985102], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 404.0, 404, 404, 404.0, 404.0, 404.0, 404.0, 2.4752475247524752, 44.10001547029702, 1.6122950185643563], "isController": false}, {"data": ["2.5 Select hpv", 316, 0, 0.0, 311.9272151898733, 178, 2708, 237.5, 522.0, 579.8999999999999, 1849.0899999999965, 0.12348694301429283, 2.7713828443273187, 0.09213283638957005], "isController": false}, {"data": ["2.5 Select flu", 328, 0, 0.0, 322.3353658536583, 179, 2433, 244.0, 554.3000000000001, 629.9000000000002, 1522.3399999999947, 0.1270399990084683, 2.942343387858539, 0.0947837492602244], "isController": false}, {"data": ["Debug Sampler", 1843, 0, 0.0, 0.6250678241996754, 0, 12, 1.0, 1.0, 1.0, 2.0, 0.6885125252868647, 6.413903479360502, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 76, 0, 0.0, 461.42105263157896, 378, 1942, 410.5, 553.5, 723.049999999999, 1942.0, 0.029992793836638724, 0.6867322331914069, 0.01804793553877713], "isController": false}, {"data": ["4.2 Vaccination batch", 1042, 0, 0.0, 462.11804222648726, 285, 6827, 355.0, 621.7, 871.3999999999996, 2106.6799999999985, 0.3888766354184511, 5.524268629924542, 0.6290533543315521], "isController": false}, {"data": ["2.2 Session register", 999, 0, 0.0, 460.9999999999997, 204, 3124, 378.0, 708.0, 903.0, 1855.0, 0.38719174363023073, 14.910554670946123, 0.2576058838853044], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 128.0, 128, 128, 128.0, 128.0, 128.0, 128.0, 7.8125, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 12987, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
