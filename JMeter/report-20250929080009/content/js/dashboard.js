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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5568300767620377, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4360146252285192, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4826325411334552, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.17947103274559195, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7074954296160878, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Get Session ID's"], "isController": true}, {"data": [0.7947103274559194, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7575231481481481, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.47411444141689374, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.22106481481481483, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.6809872029250457, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.7743055555555556, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6788194444444444, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7858942065491183, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7342569269521411, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9257, 0, 0.0, 722.9779626228805, 0, 5107, 622.0, 1278.0, 1882.6000000000022, 2847.0, 3.1274747491128068, 76.06006852204435, 3.472378059799229], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 547, 0, 0.0, 1232.416819012797, 846, 4107, 1240.0, 1570.1999999999998, 1773.4, 2323.1199999999994, 0.21965824870935718, 4.721626856077064, 0.511483625069873], "isController": false}, {"data": ["4.1 Vaccination questions", 547, 0, 0.0, 985.846435100548, 448, 4122, 1032.0, 1197.4, 1417.4000000000003, 2019.199999999999, 0.2198563658667164, 2.418938923991997, 0.462744488468192], "isController": false}, {"data": ["2.0 Register attendance", 794, 0, 0.0, 2278.850125944584, 848, 7592, 2105.5, 3842.5, 4139.25, 4911.5, 0.2723248032333254, 27.89994598573433, 0.893810601593443], "isController": true}, {"data": ["1.0 Login", 864, 0, 0.0, 3820.793981481488, 2070, 7638, 3560.0, 5502.0, 5892.25, 6571.000000000002, 0.2932620996072867, 40.05478007251788, 1.4807814175904648], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 13, 0, 0.0, 3386.0, 2986, 4352, 3188.0, 4264.4, 4352.0, 4352.0, 0.0387375146010632, 1.8248477224576272, 0.2331322102061432], "isController": true}, {"data": ["2.5 Select patient", 547, 0, 0.0, 534.7422303473493, 275, 4329, 602.0, 728.2, 864.6000000000001, 1210.7199999999998, 0.22071946475328041, 5.2301191456381275, 0.1535824897639835], "isController": false}, {"data": ["Get Session ID's", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.3 Search by first/last name", 794, 0, 0.0, 442.0692695214103, 258, 1371, 312.0, 654.5, 726.75, 944.7499999999993, 0.2725420414977867, 6.409301482942782, 0.2158970909869935], "isController": false}, {"data": ["Data prep", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["4.0 Vaccination for flu", 260, 0, 0.0, 2857.207692307692, 1998, 5323, 3018.0, 3557.4, 4043.699999999999, 4629.259999999998, 0.10488303121641726, 4.763323687288015, 0.6331351792007267], "isController": true}, {"data": ["4.0 Vaccination for hpv", 13, 0, 0.0, 3470.9230769230767, 3023, 4327, 3442.0, 4209.4, 4327.0, 4327.0, 0.03827852633562612, 1.6578121503403844, 0.23011685900399276], "isController": true}, {"data": ["1.2 Sign-in page", 864, 0, 0.0, 623.2916666666667, 142, 2570, 491.5, 1008.0, 1225.5, 1476.000000000001, 0.29337123617267347, 5.931912704061086, 0.3912140397405973], "isController": false}, {"data": ["Debug Sampler", 864, 0, 0.0, 0.4756944444444448, 0, 2, 0.0, 1.0, 1.0, 1.0, 0.2933940496019315, 1.5681633657713734, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 367, 0, 0.0, 960.1389645776568, 609, 5107, 993.0, 1249.6, 1551.3999999999992, 2041.879999999998, 0.14809876694661503, 3.8179447388064367, 0.2204126179947669], "isController": false}, {"data": ["1.4 Open Sessions list", 864, 0, 0.0, 1836.5509259259286, 795, 4227, 1815.5, 2842.0, 3170.75, 3732.4500000000003, 0.2931499607945857, 22.184401345113844, 0.18914642912641652], "isController": false}, {"data": ["4.2 Vaccination batch", 547, 0, 0.0, 674.2193784277881, 421, 2213, 753.0, 865.2, 1011.8000000000008, 1571.119999999999, 0.22015660500001008, 3.122359117507079, 0.35587375344372024], "isController": false}, {"data": ["1.1 Homepage", 864, 0, 0.0, 594.2523148148146, 409, 2248, 487.0, 818.0, 866.25, 1187.5000000000011, 0.29350248678814184, 5.801851251436514, 0.38771902230296185], "isController": false}, {"data": ["1.3 Sign-in", 864, 0, 0.0, 766.6990740740738, 407, 3256, 767.5, 1210.5, 1263.25, 1776.8000000000002, 0.29316975546792134, 6.133155316051587, 0.5129310946310575], "isController": false}, {"data": ["2.2 Session register", 794, 0, 0.0, 464.4231738035263, 256, 2017, 324.0, 718.5, 914.75, 1162.1499999999971, 0.2725005113674584, 7.898937375633032, 0.18141753987379178], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 261, 0, 0.0, 2874.229885057471, 1987, 6304, 3024.0, 3658.8, 3987.5999999999995, 5357.179999999996, 0.1072755423682905, 5.158498811080783, 0.6507709999323876], "isController": true}, {"data": ["2.1 Open session", 794, 0, 0.0, 559.4609571788425, 309, 3380, 579.5, 821.5, 946.0, 1151.6999999999985, 0.2724030962008345, 4.411643552893717, 0.17895851777292973], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9257, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
