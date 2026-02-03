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

    var data = {"OkPercent": 99.92643452672878, "KoPercent": 0.07356547327121138};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1781082398829839, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.06505847953216375, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.3054363376251788, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.44950213371266, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.30678670360110805, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.13421828908554573, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.1994459833795014, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.2697642163661581, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.4398016997167139, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4110169491525424, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8156, 6, 0.07356547327121138, 3110.234060814127, 299, 30002, 1599.0, 11016.5, 12897.449999999999, 17746.300000000003, 4.494614838621505, 1836.3324231071822, 18.63863314004864], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 652, 0, 0.0, 4924.605828220861, 2467, 30002, 3826.0, 6773.800000000003, 13489.000000000015, 23861.46, 0.39728166721810826, 160.27318320088833, 2.060811771891469], "isController": false}, {"data": ["4.1 Vaccination questions", 684, 0, 0.0, 2575.1915204678335, 1107, 27412, 2154.5, 3424.0, 4612.25, 15891.949999999973, 0.3990325211504738, 157.5427179053374, 1.9822644191334928], "isController": false}, {"data": ["2.0 Register attendance", 701, 6, 0.8559201141226819, 7526.376604850215, 2812, 37281, 6683.0, 11100.800000000008, 17782.499999999996, 28825.100000000017, 0.40311496884916137, 761.6042434562464, 6.9120258547072435], "isController": true}, {"data": ["1.0 Login", 720, 0, 0.0, 18956.952777777788, 4307, 58914, 17562.5, 23914.499999999996, 28021.549999999992, 46565.57999999998, 0.39918676784572765, 664.0014135092564, 6.606961700281982], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 168, 0, 0.0, 9375.45238095238, 4406, 47272, 7616.0, 13041.199999999997, 22007.749999999985, 39561.940000000024, 0.0993362211791919, 117.44066035064947, 1.4358112103290748], "isController": true}, {"data": ["2.5 Select patient", 699, 0, 0.0, 1539.7195994277542, 637, 18976, 1353.0, 2317.0, 2830.0, 8089.0, 0.4005627362045105, 162.96069225202643, 1.4237740600887083], "isController": false}, {"data": ["2.3 Search by first/last name", 703, 0, 0.0, 1179.7112375533422, 632, 13516, 796.0, 1514.8000000000002, 2622.7999999999965, 11315.440000000013, 0.39979936100346797, 162.77500601405154, 1.4865095084572066], "isController": false}, {"data": ["4.0 Vaccination for flu", 173, 0, 0.0, 9237.641618497108, 2844, 45102, 7979.0, 11562.199999999999, 19349.899999999976, 36442.519999999895, 0.10205381834656296, 120.3100661749698, 1.4693970905223268], "isController": true}, {"data": ["4.0 Vaccination for hpv", 168, 0, 0.0, 9629.136904761908, 4378, 49679, 7582.5, 13694.399999999996, 25961.24999999995, 42919.07000000002, 0.0994319358806059, 117.20849068554325, 1.436393588519281], "isController": true}, {"data": ["1.2 Sign-in page", 722, 0, 0.0, 1742.2700831024943, 299, 23117, 1299.0, 2760.2000000000003, 3926.600000000003, 12292.839999999993, 0.403428358778562, 161.8950013001764, 1.7064771624346733], "isController": false}, {"data": ["2.4 Patient attending session", 442, 6, 1.3574660633484164, 3429.371040723984, 1219, 25593, 2882.0, 5016.799999999999, 6581.049999999999, 14829.349999999986, 0.27179794958578485, 110.83113928326665, 1.1877984992540929], "isController": false}, {"data": ["1.4 Open Sessions list", 719, 0, 0.0, 13363.26703755214, 10336, 25387, 12764.0, 16121.0, 18885.0, 21891.799999999996, 0.3998892101103561, 183.84828494403914, 1.4198566483736355], "isController": false}, {"data": ["4.2 Vaccination batch", 678, 0, 0.0, 2120.9837758112094, 1072, 20123, 1662.0, 2889.3, 3985.749999999999, 11529.63000000003, 0.3986849277692285, 158.45759593190692, 1.7837755558214763], "isController": false}, {"data": ["1.1 Homepage", 722, 0, 0.0, 2077.198060941829, 1092, 18238, 1572.5, 2966.500000000002, 4487.55, 11614.929999999988, 0.4033395621922231, 161.68506290222228, 1.6932506089198376], "isController": false}, {"data": ["1.3 Sign-in", 721, 0, 0.0, 1795.7184466019419, 796, 16699, 1387.0, 2522.6000000000004, 3600.699999999998, 11930.239999999989, 0.4023980917065809, 161.81013425867917, 1.842079970307095], "isController": false}, {"data": ["2.2 Session register", 706, 0, 0.0, 1173.5042492917833, 636, 14563, 845.5, 1628.200000000001, 2470.25, 11164.079999999967, 0.39994448362691865, 167.9798276053749, 1.4272994417913663], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 169, 0, 0.0, 9428.100591715975, 3740, 48018, 7702.0, 13299.0, 21267.0, 42469.80000000009, 0.09991126224578052, 117.99355877191323, 1.4410307075269244], "isController": true}, {"data": ["2.1 Open session", 708, 0, 0.0, 1477.8714689265546, 651, 19211, 1058.0, 2002.7000000000007, 3316.7499999999973, 13487.73999999998, 0.3993033622696674, 159.42942779683665, 1.421509218662582], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, 100.0, 0.07356547327121138], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8156, 6, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 442, 6, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
