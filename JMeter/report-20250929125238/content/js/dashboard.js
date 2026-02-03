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

    var data = {"OkPercent": 99.84948394495413, "KoPercent": 0.15051605504587157};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5528860154930397, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2897560975609756, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5190243902439025, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.016585365853658537, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8321951219512195, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Get Session ID's"], "isController": true}, {"data": [0.8741463414634146, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7570815450643776, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.36712184873949577, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.3369098712446352, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.7614634146341464, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.7896995708154506, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6351931330472103, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.8453658536585366, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.78, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 13952, 21, 0.15051605504587157, 774.5856508027495, 0, 11179, 526.0, 1612.7000000000007, 2223.3499999999985, 4158.879999999997, 9.559254772775857, 226.91329967847483, 11.078034249342938], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1025, 0, 0.0, 1844.6331707317056, 668, 11179, 1336.0, 3590.399999999999, 4719.199999999999, 7499.380000000001, 0.791949160727048, 16.003683137036177, 1.8442033184601416], "isController": false}, {"data": ["4.1 Vaccination questions", 1025, 0, 0.0, 861.1346341463403, 324, 7962, 631.0, 1399.3999999999996, 2012.199999999999, 3956.5400000000036, 0.7920409543127596, 9.13588905389742, 1.6694851431952091], "isController": false}, {"data": ["2.0 Register attendance", 1025, 21, 2.048780487804878, 3259.2302439024415, 988, 15291, 2773.0, 5314.999999999999, 6459.099999999994, 9277.660000000002, 0.7929238700254664, 102.4407530850057, 3.3074678283226993], "isController": true}, {"data": ["1.0 Login", 1165, 0, 0.0, 3460.8832618025704, 1772, 11612, 3072.0, 5342.800000000001, 6455.900000000001, 8132.459999999995, 0.804328044329867, 104.28748825115782, 3.9293922309160227], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 256, 0, 0.0, 3377.4140625000027, 1515, 12113, 2770.0, 6056.200000000001, 6729.549999999997, 10006.090000000007, 0.19988928007845655, 9.358411135697102, 1.2114398767596697], "isController": true}, {"data": ["2.5 Select patient", 1025, 0, 0.0, 532.0439024390249, 205, 7843, 312.0, 1053.8, 1516.7999999999997, 3015.1600000000008, 0.7957351700194936, 18.322014566611575, 0.5538683719141972], "isController": false}, {"data": ["Get Session ID's", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.3 Search by first/last name", 1025, 0, 0.0, 449.0087804878054, 197, 4404, 281.0, 902.4, 1243.4999999999995, 2505.580000000001, 0.7945397676843236, 19.109277923228078, 0.6289892012840538], "isController": false}, {"data": ["Data prep", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["4.0 Vaccination for flu", 256, 0, 0.0, 3258.078124999999, 1552, 13182, 2579.5, 5457.1, 6437.749999999999, 12021.190000000002, 0.1996243008275831, 9.061171537073974, 1.2037281982581218], "isController": true}, {"data": ["4.0 Vaccination for hpv", 256, 0, 0.0, 3386.6015625, 1569, 12688, 2717.0, 5868.500000000001, 7153.049999999997, 9376.420000000004, 0.19847838407583115, 8.589717196407541, 1.201382366087177], "isController": true}, {"data": ["1.2 Sign-in page", 1165, 0, 0.0, 608.9339055793985, 87, 4336, 424.0, 1199.6000000000008, 1629.0000000000005, 2992.419999999999, 0.8057638745276944, 14.315076472135786, 1.0177247032938797], "isController": false}, {"data": ["Debug Sampler", 1165, 0, 0.0, 0.4523605150214592, 0, 15, 0.0, 1.0, 1.0, 1.0, 0.8065320092823872, 4.212945262784052, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 952, 21, 2.2058823529411766, 1286.0850840336113, 211, 11153, 928.5, 2434.5, 3283.999999999998, 4985.790000000002, 0.7383004200246928, 18.34833103002215, 1.0879042027576915], "isController": false}, {"data": ["1.4 Open Sessions list", 1165, 0, 0.0, 1450.3622317596578, 833, 6207, 1276.0, 2100.2000000000003, 2550.300000000001, 3940.399999999987, 0.8052681819532834, 61.02311496071639, 0.5179438559160945], "isController": false}, {"data": ["4.2 Vaccination batch", 1025, 0, 0.0, 644.7990243902449, 296, 5679, 446.0, 1184.0, 1618.2999999999988, 3112.4000000000005, 0.7922815544486803, 11.22095699326638, 1.2787617528205224], "isController": false}, {"data": ["1.1 Homepage", 1165, 0, 0.0, 629.2137339055814, 256, 6134, 405.0, 1216.800000000001, 1695.1000000000001, 3429.8199999999943, 0.8052926737721361, 13.963038902375716, 1.0057349183457422], "isController": false}, {"data": ["1.3 Sign-in", 1165, 0, 0.0, 772.3733905579397, 296, 5715, 610.0, 1362.4, 1771.1000000000001, 3596.399999999995, 0.8052626158385825, 15.1172807596927, 1.3932286626575188], "isController": false}, {"data": ["2.2 Session register", 1025, 0, 0.0, 487.2048780487799, 193, 4722, 310.0, 937.0, 1285.4999999999995, 2468.920000000001, 0.7948989974190986, 29.806151095661637, 0.5261245312519388], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 257, 0, 0.0, 3380.058365758755, 1542, 12064, 2781.0, 5887.0, 7028.299999999999, 9042.89999999999, 0.2016793533704779, 9.706036524954877, 1.2219032324119126], "isController": true}, {"data": ["2.1 Open session", 1025, 0, 0.0, 596.0146341463415, 210, 5527, 417.0, 1116.1999999999998, 1467.6999999999998, 3334.9200000000005, 0.7936323585205144, 12.89172365455119, 0.5183108890230966], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, 100.0, 0.15051605504587157], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 13952, 21, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 952, 21, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
