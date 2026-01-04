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

    var data = {"OkPercent": 99.7676219984508, "KoPercent": 0.23237800154918667};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4438500309488018, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.023044692737430168, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.44141689373297005, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0033112582781456954, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8881491344873502, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8875661375661376, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6426751592356688, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.2194767441860465, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.36270753512132825, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.5156675749318801, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.6259541984732825, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5517241379310345, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.8287220026350461, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.002631578947368421, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6128608923884514, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9037, 21, 0.23237800154918667, 996.8270443731275, 254, 14399, 743.0, 1855.0, 2330.1000000000004, 3933.480000000003, 5.0197077826855905, 2050.560472942174, 20.836787972684057], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 716, 0, 0.0, 2423.0656424581002, 1285, 14399, 2083.0, 3537.1000000000004, 4225.95, 7514.7100000000055, 0.42931038721278625, 173.39414725357526, 2.2268661154934883], "isController": false}, {"data": ["4.1 Vaccination questions", 734, 0, 0.0, 1276.4577656675747, 517, 12181, 1140.5, 1551.5, 1898.0, 3124.8999999999996, 0.42842900802924994, 169.12342253927653, 2.136100648859818], "isController": false}, {"data": ["2.0 Register attendance", 755, 21, 2.781456953642384, 3773.708609271524, 1346, 15677, 3551.0, 5168.799999999999, 5911.19999999999, 8815.399999999952, 0.43075831149588384, 861.5068786673294, 7.907445456833453], "isController": true}, {"data": ["1.0 Login", 783, 0, 0.0, 3701.639846743297, 1980, 13204, 3496.0, 4579.6, 5164.0, 7718.5999999999985, 0.4380196588593252, 729.5960436638261, 7.233523247033299], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 186, 0, 0.0, 4260.129032258065, 1705, 14299, 3969.5, 5560.300000000002, 5986.25, 10737.219999999981, 0.11018565690792982, 130.64825524566663, 1.599694832751798], "isController": true}, {"data": ["2.5 Select patient", 751, 0, 0.0, 461.3648468708387, 259, 8947, 351.0, 651.6000000000001, 1019.9999999999991, 2134.4800000000128, 0.42664733592541, 173.5110072110004, 1.5165191716480062], "isController": false}, {"data": ["2.3 Search by first/last name", 756, 0, 0.0, 451.10317460317435, 256, 7986, 360.0, 657.1000000000005, 884.6999999999991, 1625.2999999999945, 0.42750992433752927, 174.2112765947859, 1.5895788756870695], "isController": false}, {"data": ["4.0 Vaccination for flu", 159, 0, 0.0, 4665.490566037737, 3174, 16714, 4188.0, 6039.0, 8288.0, 13645.60000000003, 0.11431134960724346, 136.5971818567758, 1.6716567513702982], "isController": true}, {"data": ["4.0 Vaccination for hpv", 199, 0, 0.0, 4350.6733668341685, 1507, 14537, 3995.0, 5872.0, 7312.0, 11954.0, 0.1176072885787366, 138.63737356847108, 1.7014451946710898], "isController": true}, {"data": ["1.2 Sign-in page", 785, 0, 0.0, 800.3171974522294, 304, 10924, 599.0, 1291.3999999999999, 1608.5999999999974, 2780.3999999999996, 0.43758528732351654, 175.8359242086953, 1.8536955235930936], "isController": false}, {"data": ["2.4 Patient attending session", 688, 21, 3.052325581395349, 1818.1860465116274, 268, 13732, 1560.0, 2675.2000000000003, 3210.55, 5478.0, 0.39315453944917217, 160.4555105664211, 1.7133689918929018], "isController": false}, {"data": ["1.4 Open Sessions list", 783, 0, 0.0, 1256.772669220946, 693, 5206, 1121.0, 1808.0, 2000.0, 2763.0399999999945, 0.43873755649516494, 201.7532939724436, 1.5579732645001922], "isController": false}, {"data": ["4.2 Vaccination batch", 734, 0, 0.0, 789.4795640326976, 388, 6503, 698.5, 1074.0, 1342.25, 3038.0499999999993, 0.4280737033274274, 170.1035706491834, 1.9154398245889268], "isController": false}, {"data": ["1.1 Homepage", 786, 0, 0.0, 707.0419847328247, 367, 3983, 612.0, 1018.2000000000003, 1301.6, 2000.3799999999999, 0.43746893608779214, 175.59975939730305, 1.8401595874573313], "isController": false}, {"data": ["1.3 Sign-in", 783, 0, 0.0, 935.9412515964236, 371, 9374, 819.0, 1415.2, 1726.1999999999991, 2383.8799999999906, 0.4386458783253475, 176.5913912849033, 1.9831543246394057], "isController": false}, {"data": ["2.2 Session register", 759, 0, 0.0, 500.30830039525733, 254, 7456, 422.0, 741.0, 950.0, 1731.9999999999977, 0.4278232813651114, 178.344110808555, 1.527480423843792], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 190, 0, 0.0, 4480.694736842105, 1495, 17033, 4127.5, 5863.3, 7242.849999999999, 13093.610000000015, 0.11284529919149312, 133.916640444364, 1.6353044740636957], "isController": true}, {"data": ["2.1 Open session", 762, 0, 0.0, 705.9960629921255, 278, 4442, 635.0, 1056.3000000000004, 1356.9000000000008, 2359.9900000000007, 0.42857263378130983, 171.04972602126975, 1.5263972946000974], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, 100.0, 0.23237800154918667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9037, 21, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 688, 21, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
